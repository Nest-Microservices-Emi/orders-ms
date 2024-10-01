import { Controller, ParseUUIDPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrdersService } from '../services/orders.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderStatusDto } from '../dto/update-order.dto';
import { OrderPaginationDto } from '../dto/order-pagination.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @MessagePattern({ cmd: 'create' })
  public async create(@Payload() dto: CreateOrderDto) {
    return await this.ordersService.create(dto);
  }

  @MessagePattern({ cmd: 'findAll' })
  findAll(@Payload() dto: OrderPaginationDto) {
    return this.ordersService.findAll(dto);
  }

  @MessagePattern({ cmd: 'findById' })
  public async findById(@Payload('id', ParseUUIDPipe) id: string) {
    return await this.ordersService.findById(id);
  }

  @MessagePattern({ cmd: 'updateStatus' })
  update(@Payload() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(dto);
  }
}
