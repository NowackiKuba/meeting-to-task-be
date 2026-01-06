import Stripe from 'stripe';

export interface IStripeService {
  createProduct(product: Stripe.ProductCreateParams): Promise<Stripe.Product>;
  createPricing(pricing: Stripe.PriceCreateParams): Promise<Stripe.Price>;
  getProducts(): Promise<Stripe.Product[]>;
  getSubscription(id: string): Promise<Stripe.Subscription>;
  cancelSubscription(id: string): Promise<Stripe.Response<Stripe.Subscription>>;
  getCharge(id: string, feedback?: string): Promise<Stripe.Charge>;
  getCustomer(
    id: string,
  ): Promise<Stripe.Customer | Stripe.DeletedCustomer | null>;
  updateCustomer(
    customerId: string,
    params: Stripe.CustomerUpdateParams,
  ): Promise<Stripe.Customer>;
  createCustomer(
    customer: Stripe.CustomerCreateParams,
  ): Promise<Stripe.Customer>;
  getInvoice(id: string): Promise<Stripe.Invoice>;
  createCheckoutSession(
    payload: Stripe.Checkout.SessionCreateParams,
  ): Promise<Stripe.Checkout.Session>;
  getProductPricing(productId: string): Promise<Stripe.Price[]>;
  updateSubscriptionMetadata(
    subscriptionId: string,
    metadata: Record<string, string>,
  ): Promise<Stripe.Subscription>;
  updateSubscription(
    params: Stripe.SubscriptionUpdateParams,
    id: string,
  ): Promise<Stripe.Subscription>;
}
