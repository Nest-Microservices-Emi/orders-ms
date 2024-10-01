import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-order.dto';
import { IsEnum, IsUUID } from 'class-validator';
import { OrderStatusList } from '../enum/order.enum';
import { OrderStatus } from '@prisma/client';

export class UpdateOrderStatusDto extends PartialType(CreateOrderDto) {

  @IsUUID()
	id: string;
  
  @IsEnum(OrderStatusList, {
		message: `Possible status are: ${ OrderStatusList }`
	})
  status: OrderStatus;
}
