import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { addMonths, addYears } from 'date-fns';
import Stripe from 'stripe';
import { Token } from 'src/constant';
import { IStripeService } from 'src/stripe/domain/ports/stripe.service';
import { IPaymentRepository } from 'src/payment/domain/ports/payment.repository.port';
import {
  Payment,
  PaymentMethod,
  PaymentStatus,
} from 'src/payment/domain/entities/payment.entity';
import { CurrencyCode } from 'src/shared/core/types';
import {
  Subscription,
  SubscriptionInterval,
  SubscriptionStatus,
  SubscriptionTier,
} from 'src/subscription/domain/entities/subscription.entity';
import { ISubscriptionRepository } from 'src/subscription/domain/ports/subscription.repository.port';
import { IUserRepository } from 'src/user/domain/ports/user.repository.port';
import { CreateUserUseCase } from 'src/user/application/use-cases';
import { IPacketRepository } from 'src/packet/domain/ports/packet.repository.port';

@Injectable()
export class StripeWebhookService {
  private readonly logger = new Logger(StripeWebhookService.name);
  private readonly stripe: Stripe;

  constructor(
    @Inject(Token.StripeService)
    private readonly stripeService: IStripeService,
    @Inject(Token.PaymentRepository)
    private readonly paymentRepository: IPaymentRepository,
    @Inject(Token.SubscriptionRepository)
    private readonly subscriptionRepository: ISubscriptionRepository,
    @Inject(Token.UserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(Token.PacketRepository)
    private readonly packetRepository: IPacketRepository,
    private readonly createUserUseCase: CreateUserUseCase,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
      apiVersion: '2025-10-29.clover',
    });
  }

  async handleWebhook(signature: string, rawBody: Buffer | string) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new BadRequestException('Missing STRIPE_WEBHOOK_SECRET');
    }

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret,
      );
    } catch (err: any) {
      this.logger.error(
        `Webhook signature verification failed: ${err.message}`,
      );
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    this.logger.log(`Processing webhook event: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session,
        );
        break;
      case 'customer.created':
        await this.handleCustomerCreated(event.data.object as Stripe.Customer);
        break;
      case 'invoice.created':
        await this.handleInvoiceCreated(event.data.object as Stripe.Invoice);
        break;
      case 'invoice.finalized':
        await this.handleInvoiceFinalized(event.data.object as Stripe.Invoice);
        break;
      case 'invoice.payment_failed':
        await this.handleInvoiceFailed(event.data.object as Stripe.Invoice);
        break;
      case 'invoice.payment_succeeded':
      case 'invoice.paid':
        await this.handleInvoiceSucceeded(event.data.object as Stripe.Invoice);
        break;
      case 'customer.subscription.created':
        await this.handleSubscriptionCreated(
          event.data.object as Stripe.Subscription,
        );
        break;
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription,
        );
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription,
        );
        break;
      case 'customer.subscription.trial_will_end':
        await this.handleSubscriptionTrialWillEnd(
          event.data.object as Stripe.Subscription,
        );
        break;
      default:
        this.logger.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    this.logger.log(`Checkout completed for session: ${session.id}`);
    if (session.mode !== 'subscription' || !session.subscription) {
      return;
    }

    const packetId = session.metadata?.packetId;
    await this.createOrUpdateSubscription({
      stripeSubscriptionId: session.subscription.toString(),
      packetId,
      existingId: session.metadata?.subId,
    });
  }

  private async handleCustomerCreated(customer: Stripe.Customer) {
    this.logger.log(`Customer created: ${customer.id}`);
    await this.createUser({ customerId: customer.id });
  }

  private async handleInvoiceCreated(invoice: Stripe.Invoice) {
    this.logger.log(`Invoice created: ${invoice.id}`);
    await this.createOrUpdatePayment(invoice, PaymentStatus.PENDING);
  }

  private async handleInvoiceFinalized(invoice: Stripe.Invoice) {
    this.logger.log(`Invoice finalized: ${invoice.id}`);
    await this.createOrUpdatePayment(invoice, PaymentStatus.PENDING);
  }

  private async handleInvoiceFailed(invoice: Stripe.Invoice) {
    this.logger.log(`Invoice failed: ${invoice.id}`);
    await this.createOrUpdatePayment(invoice, PaymentStatus.FAILED);
  }

  private async handleInvoiceSucceeded(invoice: Stripe.Invoice) {
    this.logger.log(`Invoice succeeded: ${invoice.id}`);
    await this.createOrUpdatePayment(invoice, PaymentStatus.PAID);
  }

  private async handleSubscriptionCreated(subscription: Stripe.Subscription) {
    this.logger.log(`Subscription created: ${subscription.id}`);
    await this.createOrUpdateSubscription({
      stripeSubscriptionId: subscription.id,
      packetId: subscription.metadata?.packetId,
    });
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    this.logger.log(`Subscription updated: ${subscription.id}`);
    await this.createOrUpdateSubscription({
      stripeSubscriptionId: subscription.id,
      packetId: subscription.metadata?.packetId,
    });
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    this.logger.log(`Subscription deleted: ${subscription.id}`);
    const existing = await this.subscriptionRepository.getByStripeId(
      subscription.id,
    );
    if (!existing) return;

    const canceled = new Subscription({
      ...existing.toJSON(),
      status: SubscriptionStatus.CANCELED,
      cancelAtPeriodEnd: false,
    });
    await this.subscriptionRepository.update(canceled);
  }

  private async handleSubscriptionTrialWillEnd(
    subscription: Stripe.Subscription,
  ) {
    this.logger.log(`Subscription trial will end: ${subscription.id}`);
    // Keep as a log hook; extend with notifications if needed.
  }

  private async createUser({ customerId }: { customerId: string }) {
    const customer = await this.stripeService.getCustomer(customerId);
    if (!customer || (customer as Stripe.DeletedCustomer).deleted) {
      return null;
    }
    const customerObj = customer as Stripe.Customer;

    if (!customerObj.email) {
      this.logger.warn(
        `Customer ${customerId} has no email. Cannot create user.`,
      );
      return null;
    }

    let existingUser =
      await this.userRepository.getByStripeCustomerId(customerId);
    if (!existingUser) {
      existingUser = await this.userRepository.findByEmail(customerObj.email);
    }

    if (existingUser) {
      return existingUser;
    }

    const newUser = await this.createUserUseCase.handle({
      email: customerObj.email,
      name: customerObj.name ?? customerObj.metadata?.name,
      password: '',
      stripeCustomerId: customerObj.id,
    });

    await this.stripeService.updateCustomer(customerObj.id, {
      metadata: { userId: newUser.id },
    });

    return newUser;
  }

  private async createOrUpdateSubscription({
    stripeSubscriptionId,
    packetId,
    existingId,
  }: {
    stripeSubscriptionId: string;
    packetId?: string;
    existingId?: string;
  }) {
    const stripeSubscription =
      await this.stripeService.getSubscription(stripeSubscriptionId);

    const customerId = stripeSubscription.customer?.toString();
    const userFromCustomer = customerId
      ? await this.userRepository.getByStripeCustomerId(customerId)
      : null;
    const userId = stripeSubscription.metadata?.userId ?? userFromCustomer?.id;

    if (!userId || !packetId) {
      this.logger.warn(
        `Missing userId or packetId for subscription ${stripeSubscriptionId}. Skipping.`,
      );
      return;
    }

    const packet = await this.packetRepository.getById(packetId);
    if (!packet) {
      this.logger.warn(`Packet ${packetId} not found. Skipping subscription.`);
      return;
    }

    const amount = stripeSubscription.items.data.reduce(
      (acc, curr) => acc + (curr.price.unit_amount ?? 0),
      0,
    );

    const currentPeriodStart =
      (stripeSubscription as any).current_period_start != null
        ? new Date((stripeSubscription as any).current_period_start * 1000)
        : new Date();

    const interval =
      (stripeSubscription.items.data[0]?.plan?.interval as
        | 'month'
        | 'year'
        | undefined) ?? 'month';
    const currentPeriodEnd =
      (stripeSubscription as any).current_period_end != null
        ? new Date((stripeSubscription as any).current_period_end * 1000)
        : interval === 'month'
          ? addMonths(currentPeriodStart, 1)
          : addYears(currentPeriodStart, 1);

    const existing =
      existingId?.length > 0
        ? await this.subscriptionRepository.getById(existingId)
        : await this.subscriptionRepository.getByStripeId(stripeSubscriptionId);

    const subscription = new Subscription({
      ...(existing ? existing.toJSON() : {}),
      id: existing?.id,
      userId,
      tier: packet.tier as SubscriptionTier,
      amount,
      customerId,
      currentPeriodStart,
      currentPeriodEnd,
      stripeId: stripeSubscriptionId,
      packetId: packet.id,
      status: this.mapStripeStatus(stripeSubscription.status),
      interval:
        (stripeSubscription.metadata.interval as SubscriptionInterval) ??
        SubscriptionInterval.MONTHLY,
    });

    if (existing) {
      await this.subscriptionRepository.update(subscription);
    } else {
      await this.subscriptionRepository.create(subscription);
    }

    // Keep user tier in sync with subscription tier
    await this.syncUserTier(userId, packet.tier as SubscriptionTier);
  }

  private async createOrUpdatePayment(
    invoice: Stripe.Invoice,
    statusOverride?: PaymentStatus,
  ) {
    const subscriptionId =
      invoice.lines.data[0].parent.subscription_item_details.subscription.toString();
    const dbSubscription = subscriptionId
      ? await this.subscriptionRepository.getByStripeId(subscriptionId)
      : null;

    const existingPaymentByMeta =
      invoice.metadata?.paymentId &&
      (await this.paymentRepository.getById(invoice.metadata.paymentId));

    const existingPayment =
      existingPaymentByMeta ??
      (await this.paymentRepository.getByProviderId(invoice.id));

    const gross = invoice.amount_paid ?? invoice.total ?? 0;
    const net = gross / 1.23;
    const taxAmount = gross - net;
    const currency =
      (invoice.currency?.toUpperCase() as CurrencyCode) ?? CurrencyCode.USD;
    const paidAt =
      invoice.status_transitions?.paid_at != null
        ? new Date(invoice.status_transitions.paid_at * 1000)
        : undefined;

    const payment = new Payment({
      ...(existingPayment ? existingPayment.toJSON() : {}),
      id: existingPayment?.id ?? invoice.metadata?.paymentId,
      gross,
      net,
      currency,
      taxRate: 23,
      taxAmount,
      invoiceId: invoice.id,
      method: PaymentMethod.CARD,
      status: statusOverride ?? PaymentStatus.PENDING,
      providerId: invoice.id,
      receiptUrl: invoice.hosted_invoice_url ?? undefined,
      paidAt,
      subscriptionId: dbSubscription?.id,
      metadata: invoice.metadata ?? undefined,
    });

    if (existingPayment) {
      await this.paymentRepository.update(payment);
    } else {
      await this.paymentRepository.create(payment);
    }
  }

  private async syncUserTier(userId: string, tier: SubscriptionTier) {
    const user = await this.userRepository.findById(userId);
    if (!user) return;

    const meetingsLimit =
      tier === SubscriptionTier.PRO
        ? 999999
        : tier === SubscriptionTier.BASIC
          ? 50
          : 5;

    user.updateTier(tier, meetingsLimit);
    await this.userRepository.update(user);
  }

  private mapStripeStatus(
    status: Stripe.Subscription.Status,
  ): SubscriptionStatus {
    const statusMap: Record<string, SubscriptionStatus> = {
      active: SubscriptionStatus.ACTIVE,
      canceled: SubscriptionStatus.CANCELED,
      past_due: SubscriptionStatus.PAST_DUE,
      incomplete_expired: SubscriptionStatus.CANCELED,
      trialing: SubscriptionStatus.TRIALING,
      unpaid: SubscriptionStatus.UNPAID,
    };

    return statusMap[status] ?? SubscriptionStatus.ACTIVE;
  }
}
