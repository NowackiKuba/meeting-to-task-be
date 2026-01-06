import { Injectable } from '@nestjs/common';
import { ConfigService } from 'src/config/config.service';
import { IStripeService } from 'src/stripe/domain/ports/stripe.service';
import Stripe from 'stripe';

@Injectable()
export class StripeService implements IStripeService {
  private readonly stripe: Stripe;

  constructor(private readonly configService: ConfigService) {
    this.stripe = new Stripe(this.configService.get('STRIPE_API_KEY'), {
      apiVersion: '2025-10-29.clover',
      typescript: true,
    });
  }

  async createProduct(
    product: Stripe.ProductCreateParams,
  ): Promise<Stripe.Product> {
    const res = await this.stripe.products.create({ ...product });
    ///
    return res;
  }

  async createCheckoutSession(
    payload: Stripe.Checkout.SessionCreateParams,
  ): Promise<Stripe.Checkout.Session> {
    const res = await this.stripe.checkout.sessions.create(payload);

    return res;
  }

  async createPricing(
    pricing: Stripe.PriceCreateParams,
  ): Promise<Stripe.Price> {
    const res = await this.stripe.prices.create({ ...pricing });

    return res;
  }

  async getProducts(): Promise<Stripe.Product[]> {
    const res = await this.stripe.products.list({
      limit: 100,
    });

    return res.data;
  }

  async getProductPricing(productId: string): Promise<Stripe.Price[]> {
    const prices = await this.stripe.prices.list({ limit: 100 });

    const target = prices.data.filter((price) => price.product === productId);

    return target;
  }

  async createCustomer(
    customer: Stripe.CustomerCreateParams,
  ): Promise<Stripe.Customer> {
    const res = await this.stripe.customers.create(customer);

    return res;
  }

  async getCustomer(
    id: string,
  ): Promise<Stripe.Customer | Stripe.DeletedCustomer | null> {
    const res = await this.stripe.customers.retrieve(id);

    return res ? res : null;
  }

  async updateSubscriptionMetadata(
    subscriptionId: string,
    metadata: Record<string, string>,
  ): Promise<Stripe.Subscription> {
    const res = await this.stripe.subscriptions.update(subscriptionId, {
      metadata,
    });

    return res;
  }

  async getCharge(id: string): Promise<Stripe.Charge> {
    const charge = await this.stripe.charges.retrieve(id);

    return charge;
  }

  async getInvoice(id: string): Promise<Stripe.Invoice> {
    const inv = await this.stripe.invoices.retrieve(id);

    return inv;
  }

  async getSubscription(id: string): Promise<Stripe.Subscription> {
    const subscription = await this.stripe.subscriptions.retrieve(id);

    return subscription;
  }

  async updateCustomer(
    customerId: string,
    params: Stripe.CustomerUpdateParams,
  ): Promise<Stripe.Customer> {
    return await this.stripe.customers.update(customerId, params);
  }

  async cancelSubscription(
    id: string,
  ): Promise<Stripe.Response<Stripe.Subscription>> {
    const res = await this.stripe.subscriptions.cancel(id);

    return res;
  }

  async updateSubscription(
    params: Stripe.SubscriptionUpdateParams,
    id: string,
  ): Promise<Stripe.Subscription> {
    const updated = await this.stripe.subscriptions.update(id, params);

    return updated;
  }
}
