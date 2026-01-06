import { Controller, Get, Param } from '@nestjs/common';
import { GetPaymentByIdUseCase } from 'src/payment/application/use-cases';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly getPaymentByIdUseCase: GetPaymentByIdUseCase) {}

  @Get(':id')
  async get(@Param('id') id: string) {
    return await this.getPaymentByIdUseCase.handle(id);
  }
}
