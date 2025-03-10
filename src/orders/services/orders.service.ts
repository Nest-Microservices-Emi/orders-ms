import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderStatusDto } from '../dto/update-order.dto';
import { PrismaService } from '../../../prisma/services/prisma.service';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { Order } from '@prisma/client';
import { PaginationResponse } from '../../common/pagination-response.type';
import { OrderPaginationDto } from '../dto/order-pagination.dto';
import { NATS_SERVICE, PRODUCT_SERVICE } from 'src/config/services';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger('OrdersService');

  constructor(
    private readonly prismaService: PrismaService,
    @Inject(NATS_SERVICE) private readonly client: ClientProxy
  ) {}

  public async create(dto: CreateOrderDto) {
    try {
      const productIds = dto.items.map( i => i.productId );
      const products: any[] = await firstValueFrom(
        this.client.send({ cmd: 'validateProducts' }, { ids: productIds })
      );

      const totalAmount = dto.items.reduce( (acc, orderItem) => {
        const productPrice = products.find( product => product.id === orderItem.productId ).price;
        return acc + (productPrice * orderItem.quantity);
      }, 0);

      const totalItems = dto.items.reduce( (acc, orderItem) => {
        return acc + (orderItem.quantity);
      }, 0)

      const order = await this.prismaService.order.create({
        data: {
          totalItems,
          totalAmount,
          orderItems: {
            createMany: {
              data: dto.items.map( orderItem => ({
                price: products.find( product => product.id === orderItem.productId ).price,
                productId: orderItem.productId,
                quantity: orderItem.quantity
              }))
            }
          }
        },
        include: {
          orderItems: {
            select: {
              price: true,
              quantity: true,
              productId: true
            }
          },
        }
      });

      return {
        ...order,
        orderItems: order.orderItems.map( orderItem => ({
          ...orderItem,
          productName: products.find( product => product.id === orderItem.productId ).name 
        }))
      };
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: 'Check logs to see errors.'
      })
    }
  }

  public async findAll(dto: OrderPaginationDto): Promise<PaginationResponse<Order>> {
    const { page, limit } = dto;
    const totalPages = await this.prismaService.order.count({ where: { status: dto?.status } });
    const lastPage = Math.ceil( totalPages / limit );

    const data = await this.prismaService.order.findMany({
      skip: (page - 1) * limit,
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
      include: {
        orderItems: {
          select: {
            price: true,
            quantity: true,
            productId: true,
          }
        }
      }
    });

    if(!order) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Order with Id: ${id} not found.`
      });
    }

    const productIds = order.orderItems.map( orderItem => orderItem.productId);
    const products: any[] = await firstValueFrom(
      this.client.send({ cmd: 'validateProducts' }, { ids: productIds })
    );

    return {
      ...order,
      OrderItem: order.orderItems.map( orderItem => ({
        ...orderItem,
        name: products.find(product => product.id === orderItem.productId).name
      }))
    };
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
