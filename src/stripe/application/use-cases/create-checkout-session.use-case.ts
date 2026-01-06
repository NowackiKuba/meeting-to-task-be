import { Inject, Injectable, Logger } from '@nestjs/common';
import { Token } from 'src/constant';
import { CreateCheckoutSessionTransformed } from 'src/stripe/application/dto/create-checkout-session';
import Stripe from 'stripe';
import { addMinutes } from 'date-fns';
import {
  SubscriptionInterval,
  SubscriptionStatus,
} from '@subscription/domain/entities/subscription.entity';
import { IStripeService } from 'src/stripe/domain/ports/stripe.service';
import { ISubscriptionRepository } from 'src/subscription/domain/ports/subscription.repository.port';
import { IPacketRepository } from 'src/packet/domain/ports/packet.repository.port';
import { AuthUser } from 'src/auth/domain/interfaces/auth-user.interface';
import {
  Payment,
  PaymentMethod,
  PaymentStatus,
} from 'src/payment/domain/entities/payment.entity';
import { IPaymentRepository } from 'src/payment/domain/ports/payment.repository.port';
import { CurrencyCode } from 'src/shared/core/types';
import { IUserRepository } from 'src/user/domain/ports/user.repository.port';

@Injectable()
export class CreateCheckoutSessionUseCase {
  private readonly logger = new Logger(CreateCheckoutSessionUseCase.name);

  constructor(
    @Inject(Token.StripeService)
    private readonly stripeService: IStripeService,
    @Inject(Token.SubscriptionRepository)
    private readonly subscriptionRepository: ISubscriptionRepository,
    @Inject(Token.PaymentRepository)
    private readonly paymentRepository: IPaymentRepository,
    @Inject(Token.PacketRepository)
    private readonly packetRepository: IPacketRepository,
    @Inject(Token.UserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  async handle(payload: CreateCheckoutSessionTransformed, user?: AuthUser) {
    const dbUser = await this.userRepository.findByEmail(payload.email);
    if (dbUser) {
      const subscription = await this.subscriptionRepository.getByUserId(
        dbUser.id,
      );

      if (subscription) {
        if (
          subscription.status === SubscriptionStatus.ACTIVE ||
          subscription.status === SubscriptionStatus.CANCELED
        ) {
          this.logger.log(
            `User ${dbUser.id} has active subscription, allowing checkout session creation`,
          );
        }
      }
    }
    // Get the selected packet
    if (!payload.packetId) {
      throw new Error('Packet ID is required');
    }
    const packet = await this.packetRepository.getById(payload.packetId);

    if (!packet) {
      throw new Error(`Packet with id ${payload.packetId} not found`);
    }

    const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = {
      price:
        payload.interval === SubscriptionInterval.MONTHLY
          ? packet.monthlyPriceId
          : packet.yearlyPriceId,
      quantity: 1,
    };

    console.log('LINE ITEM: ', lineItem);
    console.log('PACKET ID being set in metadata: ', payload.packetId);
    const checkoutPayload: Stripe.Checkout.SessionCreateParams = {
      adaptive_pricing: {
        enabled: false,
      },
      after_expiration: {
        recovery: {
          enabled: true,
          allow_promotion_codes: false,
        },
      },
      allow_promotion_codes: false,
      automatic_tax: {
        enabled: true,
      },
      billing_address_collection: 'auto',
      consent_collection: {
        payment_method_reuse_agreement: {
          position: 'auto',
        },
      },
      currency: 'usd',
      customer_email: dbUser.email,
      excluded_payment_method_types: ['crypto'],
      line_items: [lineItem],
      expires_at: payload.expiresInMs
        ? Math.floor((new Date().getTime() + payload.expiresInMs) / 1000)
        : Math.floor(addMinutes(new Date(), 30).getTime() / 1000),
      locale: 'pl',
      metadata: {
        packetId: payload.packetId,
        subId: payload.subscriptionId,
      },
      mode: 'subscription',
      name_collection: {
        business: {
          enabled: true,
          optional: true,
        },
        individual: {
          enabled: true,
          optional: false,
        },
      },
      success_url:
        'http://localhost:5173/payments/checkout/finalize?status=success',

      payment_method_collection: 'if_required',
      payment_method_data: {
        // allow_redisplay: 'always', // Removed to allow payment_method_save to be enabled
      },
      phone_number_collection: {
        enabled: true,
      },
      custom_fields: [
        {
          key: 'nip',
          label: {
            custom: 'NIP',
            type: 'custom',
          },
          type: 'text',
          optional: true,
        },
      ],
      //   return_url: 'http://localhost:8080/payments/checkout/finalize',
      saved_payment_method_options: {
        allow_redisplay_filters: ['always'],
        payment_method_remove: 'disabled',
        payment_method_save: 'enabled',
      },
      //   setup_intent_data: {

      //
      submit_type: 'subscribe',
      subscription_data: {
        metadata: {
          packetId: payload.packetId,
          source: 'custom',
          subId: payload.subscriptionId,
          userId: dbUser.id,
          interval: payload.interval,
        },

        billing_mode: {
          type: 'classic',
        },
      },
      wallet_options: {
        link: {
          display: 'never',
        },
      },
      ui_mode: 'hosted',
    };

    const res = await this.stripeService.createCheckoutSession(checkoutPayload);

    // If subscription was created immediately, ensure metadata is set
    if (res.subscription) {
      const subscriptionId =
        typeof res.subscription === 'string'
          ? res.subscription
          : res.subscription.id;

      try {
        // Update subscription metadata directly to ensure it's set
        await this.stripeService.updateSubscriptionMetadata(subscriptionId, {
          packetId: payload.packetId,
          source: 'custom',
        });
        console.log(
          `Updated subscription ${subscriptionId} metadata with packetId: ${payload.packetId}`,
        );
      } catch (error) {
        console.error(
          `Failed to update subscription metadata: ${error.message}`,
        );
        // Don't throw - metadata might be set via subscription_data
      }
    }

    console.log('Checkout session created with metadata:', {
      sessionId: res.id,
      sessionMetadata: res.metadata,
      subscriptionId:
        typeof res.subscription === 'string'
          ? res.subscription
          : res.subscription?.id,
    });

    return res;
  }
}
