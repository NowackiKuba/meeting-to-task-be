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
import { UpdateCreditUseCase } from 'src/credit/application/use-cases/update-credit.use-case';
import { ICreditRepository } from 'src/credit/domain/ports/credit.repository.port';
import { CreateCreditUseCase } from 'src/credit/application/use-cases/create-credit.use-case';
import { CreateCreditHistoryUseCase } from 'src/credit/application/use-cases/create-credit-history.use-case';
import { CreditHistoryType } from 'src/credit/domain/entities/credit-history.entity';
import { Credit } from 'src/credit/domain/entities/credit.entity';
import { differenceInMonths } from 'date-fns';

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
    @Inject(Token.CreditRepository)
    private readonly creditRepository: ICreditRepository,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly updateCreditUseCase: UpdateCreditUseCase,
    private readonly createCreditUseCase: CreateCreditUseCase,
    private readonly createCreditHistoryUseCase: CreateCreditHistoryUseCase,
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
    // Note: Reset logic is handled in handleSubscriptionUpdated to avoid duplicates
    // when both invoice.payment_succeeded and customer.subscription.updated fire
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

    // Get subscription before update to compare billing cycles
    const dbSubscriptionBefore =
      await this.subscriptionRepository.getByStripeId(subscription.id);
    const previousPeriodStart = dbSubscriptionBefore?.currentPeriodStart;

    // Update subscription
    await this.createOrUpdateSubscription({
      stripeSubscriptionId: subscription.id,
      packetId: subscription.metadata?.packetId,
    });

    // Only check for billing cycle change if we had a previous subscription
    // This prevents duplicate resets on first subscription creation
    if (previousPeriodStart && dbSubscriptionBefore) {
      const dbSubscriptionAfter =
        await this.subscriptionRepository.getByStripeId(subscription.id);

      if (
        dbSubscriptionAfter &&
        dbSubscriptionAfter.currentPeriodStart.getTime() !==
          previousPeriodStart.getTime()
      ) {
        this.logger.log(
          `Billing cycle changed for subscription ${subscription.id}. Previous: ${previousPeriodStart.toISOString()}, New: ${dbSubscriptionAfter.currentPeriodStart.toISOString()}`,
        );
        await this.resetUserLimitsAndCreditsIfNeeded(
          dbSubscriptionAfter.userId,
          dbSubscriptionAfter.currentPeriodStart,
        );
      }
    }
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

    // Get old packet to compare credits if subscription exists
    let oldPacket = null;
    if (existing) {
      oldPacket = await this.packetRepository.getById(existing.packetId);
    }

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

    // Update credits if packet/tier changed (upgrade/downgrade)
    await this.updateCreditsOnTierChange(
      userId,
      oldPacket?.creditsIncluded ?? 0,
      packet.creditsIncluded ?? 0,
      subscription.id,
    );
  }

  private async createOrUpdatePayment(
    invoice: Stripe.Invoice,
    statusOverride?: PaymentStatus,
  ) {
    // Extract subscription ID from invoice
    const subscriptionId =
      invoice.parent.subscription_details.subscription.toString();

    // Get database subscription if exists
    const dbSubscription = subscriptionId
      ? await this.subscriptionRepository.getByStripeId(subscriptionId)
      : null;

    // Check for existing payment - try metadata paymentId first, then providerId (invoice ID)
    // This ensures idempotency if webhook is called multiple times
    let existingPayment = null;

    if (invoice.metadata?.paymentId) {
      existingPayment = await this.paymentRepository.getById(
        invoice.metadata.paymentId,
      );
    }

    if (!existingPayment) {
      existingPayment = await this.paymentRepository.getByProviderId(
        invoice.id,
      );
    }

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

  /**
   * Resets user limits and credits if billing cycle has changed.
   * This replaces the cron job logic from reset-limits.schedule.ts
   * Idempotent: Won't reset if already reset for this billing period
   */
  private async resetUserLimitsAndCreditsIfNeeded(
    userId: string,
    currentPeriodStart: Date,
  ) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      this.logger.warn(`User ${userId} not found for limit/credit reset.`);
      return;
    }

    // Check if billing cycle has changed
    // Compare current period start with user's last reset or billing cycle start
    const lastResetAt = user.lastLimitsResetAt ?? user.billingCycleStart;

    // More precise check: if billingCycleStart matches currentPeriodStart (same day), reset already done
    if (user.billingCycleStart) {
      const billingCycleStartDate = new Date(user.billingCycleStart);
      billingCycleStartDate.setHours(0, 0, 0, 0);
      const currentPeriodStartDate = new Date(currentPeriodStart);
      currentPeriodStartDate.setHours(0, 0, 0, 0);

      if (
        billingCycleStartDate.getTime() === currentPeriodStartDate.getTime()
      ) {
        this.logger.debug(
          `User ${userId} already reset for this billing period. Billing cycle start: ${user.billingCycleStart.toISOString()}, Current period: ${currentPeriodStart.toISOString()}`,
        );
        return;
      }
    }

    const shouldReset =
      !lastResetAt || differenceInMonths(currentPeriodStart, lastResetAt) >= 1;

    if (!shouldReset) {
      this.logger.debug(
        `User ${userId} not eligible for reset. Last reset: ${lastResetAt}, Current period: ${currentPeriodStart}`,
      );
      return;
    }

    this.logger.log(
      `Resetting limits and credits for user ${userId}. Last reset: ${lastResetAt}, Current period: ${currentPeriodStart}`,
    );

    // Get subscription to determine limits
    const subscription = await this.subscriptionRepository.getByUserId(userId);
    let usageLimit: number;
    let creditsIncluded = 0;

    if (subscription) {
      const packet = await this.packetRepository.getById(subscription.packetId);
      if (packet) {
        const tasksPerMonth = Number(packet.features.get('tasks_per_month'));
        usageLimit = isNaN(tasksPerMonth) ? 5 : tasksPerMonth;
        creditsIncluded = packet.creditsIncluded ?? 0;
      } else {
        usageLimit = 5;
      }
    } else {
      usageLimit = 5;
    }

    // Reset user limits - use currentPeriodStart to match subscription billing cycle
    user.resetUsage(usageLimit, currentPeriodStart);
    await this.userRepository.update(user);
    this.logger.log(
      `Reset usage limits for user ${userId} to ${usageLimit} with billing cycle start: ${currentPeriodStart.toISOString()}`,
    );

    // Handle credit reset/creation
    if (creditsIncluded > 0) {
      let credit = await this.creditRepository.getByUserId(userId);

      if (!credit) {
        // Create new credit account
        try {
          credit = await this.createCreditUseCase.handle(
            {
              balance: creditsIncluded,
              baseBalance: creditsIncluded,
            },
            userId,
          );
          this.logger.log(
            `Created credit account for user ${userId} with balance ${creditsIncluded}`,
          );
        } catch (error: any) {
          this.logger.warn(
            `Failed to create credit for user ${userId}: ${error.message}`,
          );
          return;
        }
      } else {
        // Reset existing credit
        try {
          await this.createCreditHistoryUseCase.handle({
            creditId: credit.id,
            amount: credit.baseBalance - credit.balance,
            type: CreditHistoryType.RESET,
            balanceBefore: credit.balance,
            balanceAfter: credit.baseBalance,
            reason: 'billing_cycle_reset',
            description: `Credit reset for new billing cycle starting ${currentPeriodStart.toISOString()}`,
            metadata: {
              subscriptionId: subscription?.id,
              currentPeriodStart: currentPeriodStart.toISOString(),
            },
          });
          this.logger.log(
            `Reset credit for user ${userId} from ${credit.balance} to ${credit.baseBalance}`,
          );
        } catch (error: any) {
          this.logger.error(
            `Failed to reset credit for user ${userId}: ${error.message}`,
          );
        }
      }

      // Update baseBalance if creditsIncluded changed (reload credit after reset)
      const updatedCredit = await this.creditRepository.getByUserId(userId);
      if (updatedCredit && updatedCredit.baseBalance !== creditsIncluded) {
        await this.updateCreditUseCase.handle(
          {
            baseBalance: creditsIncluded,
            balance: creditsIncluded,
            resetReason: 'billing_cycle_update',
            lastResetAt: currentPeriodStart,
          },
          updatedCredit.id,
        );
        this.logger.log(
          `Updated credit baseBalance for user ${userId} from ${updatedCredit.baseBalance} to ${creditsIncluded}`,
        );
      }
    }
  }

  /**
   * Updates credits when subscription tier changes (upgrade/downgrade)
   * Adds difference to balance and updates baseBalance
   */
  private async updateCreditsOnTierChange(
    userId: string,
    oldCreditsIncluded: number,
    newCreditsIncluded: number,
    subscriptionId: string,
  ) {
    // Only process if credits changed
    if (oldCreditsIncluded === newCreditsIncluded) {
      return;
    }

    const creditDifference = newCreditsIncluded - oldCreditsIncluded;
    this.logger.log(
      `Credits changed for user ${userId}: ${oldCreditsIncluded} -> ${newCreditsIncluded} (difference: ${creditDifference})`,
    );

    let credit = await this.creditRepository.getByUserId(userId);

    if (!credit) {
      // Create new credit account if user doesn't have one
      if (newCreditsIncluded > 0) {
        try {
          credit = await this.createCreditUseCase.handle(
            {
              balance: newCreditsIncluded,
              baseBalance: newCreditsIncluded,
            },
            userId,
          );
          this.logger.log(
            `Created credit account for user ${userId} with ${newCreditsIncluded} credits`,
          );
        } catch (error: any) {
          this.logger.warn(
            `Failed to create credit for user ${userId}: ${error.message}`,
          );
        }
      }
      return;
    }

    // Update credits: add difference to balance and update baseBalance
    const balanceBefore = credit.balance;
    const baseBalanceBefore = credit.baseBalance;

    // Add credit difference to balance
    if (creditDifference > 0) {
      // Upgrade: add credits
      await this.createCreditHistoryUseCase.handle({
        creditId: credit.id,
        amount: creditDifference,
        type: CreditHistoryType.ADD,
        balanceBefore: balanceBefore,
        balanceAfter: balanceBefore + creditDifference,
        reason: 'tier_upgrade',
        description: `Credits added due to tier upgrade (${creditDifference} credits)`,
        metadata: {
          subscriptionId,
          oldCreditsIncluded,
          newCreditsIncluded,
          creditDifference,
        },
      });
      this.logger.log(
        `Added ${creditDifference} credits to user ${userId} balance (${balanceBefore} -> ${balanceBefore + creditDifference})`,
      );
    } else if (creditDifference < 0) {
      // Downgrade: we don't remove credits, just update baseBalance
      // Balance stays the same, only baseBalance is reduced
      this.logger.log(
        `Tier downgrade for user ${userId}. Balance unchanged: ${balanceBefore}, baseBalance: ${baseBalanceBefore} -> ${newCreditsIncluded}`,
      );
    }

    // Update baseBalance to new value
    // Note: Don't pass balance here - it was already updated via createCreditHistoryUseCase above
    // If we pass balance, updateCreditUseCase will create another credit history entry with amount=balance,
    // which would double-add the credits!
    const updatedCredit = await this.creditRepository.getByUserId(userId);
    if (updatedCredit && updatedCredit.baseBalance !== newCreditsIncluded) {
      // Directly update only baseBalance without creating history entry
      // We'll use the repository directly to avoid the history entry creation
      const creditToUpdate = await this.creditRepository.getById(
        updatedCredit.id,
      );
      if (creditToUpdate) {
        const updatedCreditEntity = new Credit({
          ...creditToUpdate.toJSON(),
          baseBalance: newCreditsIncluded,
        });
        await this.creditRepository.update(updatedCreditEntity);
        this.logger.log(
          `Updated credit baseBalance for user ${userId} from ${baseBalanceBefore} to ${newCreditsIncluded}`,
        );
      }
    }
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
