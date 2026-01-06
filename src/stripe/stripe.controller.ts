import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { StripeService } from './infra/adapters/stripe.service';
import { CreateCheckoutSessionUseCase } from './application/use-cases/create-checkout-session.use-case';
import { CreateCheckoutSessionDto } from './application/dto/create-checkout-session';
import { StripeWebhookService } from './infra/adapters/stripe.webhook';
import { Request } from 'express';
import { User } from 'src/auth/infrastructure/decorators/user.decorator';
import { Public } from 'src/auth/infrastructure/decorators/public.decorator';
import { AuthUser } from 'src/auth/domain/interfaces/auth-user.interface';

@Controller('stripe')
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly createCheckoutSessionUseCase: CreateCheckoutSessionUseCase,
    private readonly stripeWebhook: StripeWebhookService,
  ) {}

  @Post('/webhooks')
  @Public()
  async handleWebhooks(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    // Get the raw body from the request
    // req.rawBody is populated by express.raw() middleware
    const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body));

    return this.stripeWebhook.handleWebhook(signature, rawBody);
  }

  @Post('/products-batch')
  @Public()
  async createProducts(
    @Body()
    body: {
      products: {
        id: string;
        object: string;
        active: boolean;
        description: string;
        metadata: { code: string; free: string };
        name: string;
        images: [];
        marketing_features: [];
      }[];
    },
  ) {
    const products = [];

    for (let i = 0; i < body.products.length; i++) {
      const prod = body.products[i];
      const product = await this.stripeService.createProduct({
        name: prod.name,
        active: prod.active,
        id: prod.id,
        description: prod.description,
        metadata: prod.metadata,
        images: prod.images,
        marketing_features: prod.marketing_features,
      });

      products.push(product);

      // Sleep for 5 seconds between iterations (except after the last one)
      if (i < body.products.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }

    return products;
  }

  @Post('/pricing')
  @Public()
  async createPricing(
    @Body()
    body: {
      pricings: {
        product: string;
        currency: string;
        unit_amount: number;
        recurring?: { interval: 'month' | 'year' };
      }[];
    },
  ) {
    const prices = [];

    for (let i = 0; i < body.pricings.length; i++) {
      const price = body.pricings[i];
      const pricing = await this.stripeService.createPricing({
        product: price.product,
        currency: price.currency,
        unit_amount: price.unit_amount,
        recurring: price.recurring,
      });

      prices.push(pricing);

      // Sleep for 5 seconds between iterations (except after the last one)
      //   if (i < body.pricings.length - 1) {
      //     await new Promise((resolve) => setTimeout(resolve, 5000));
      //   }
    }

    return prices;
  }

  @Get('/products')
  @Public()
  async getProducts() {
    return await this.stripeService.getProducts();
  }

  @Post('/checkout')
  @Public()
  async createCheckoutSession(
    @Body() body: CreateCheckoutSessionDto,
    @User() user?: AuthUser,
  ) {
    return await this.createCheckoutSessionUseCase.handle(body, user);
  }
}
