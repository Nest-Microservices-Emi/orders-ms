import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderStatusDto } from '../dto/update-order.dto';
import { PrismaService } from '../../../prisma/services/prisma.service';
import { RpcException } from '@nestjs/microservices';
import { Order } from '@prisma/client';
import { PaginationResponse } from '../../common/pagination-response.type';
import { OrderPaginationDto } from '../dto/order-pagination.dto';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger('OrdersService');

  constructor(
    private readonly prismaService: PrismaService,  
  ) {}

  public async create(dto: CreateOrderDto) {
    return await this.prismaService.order.create({
      data: dto
    })
  }

  public async findAll(dto: OrderPaginationDto): Promise<PaginationResponse<Order>> {
    const { page, limit } = dto;
    const totalPages = await this.prismaService.order.count({ where: { status: dto?.status } });
    const lastPage = Math.ceil( totalPages / limit );

    const data = await this.prismaService.order.findMany({
      skip: (page -1) * limit,
      take: limit,
      where: { status: dto?.status }
    });

    return {
      data,
      metadata: {
        totalPages,
        actualPage: page,
        lastPage
      }
    }
  }

  public async findById(id: string) {
    const order = await this.prismaService.order.findUnique({
      where: { id },
    });

    if(!order) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Order with Id: ${id} not found.`
      });
    }

    return order;
  }

  public async updateStatus(dto: UpdateOrderStatusDto) {

    const { id, status } = dto;

    const order = await this.findById(dto.id);

    if( order.status === status ) {
      return order;
    }

    return this.prismaService.order.update({
      where: { id },
      data: { status: status },
    });
  }
}
