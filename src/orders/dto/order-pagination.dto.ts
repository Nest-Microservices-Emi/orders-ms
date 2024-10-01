import { OrderStatus } from '@prisma/client';
import { PaginationDto } from '../../common/pagination.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { OrderStatusList } from '../enum/order.enum';

export class OrderPaginationDto extends PaginationDto {

	@IsOptional()
	@IsEnum( OrderStatusList, {
		message: `Valid status are: ${ OrderStatusList }`
	})
	status: OrderStatus;
}