import { Module } from '@nestjs/common';
import { OrdersService } from './services/orders.service';
import { OrdersController } from './controllers/orders.controller';
import { PrismaService } from '../../prisma/services/prisma.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PRODUCT_SERVICE } from '../config/services';
import { envs } from '../config/envs';
import { NatsModule } from 'src/transports/nats.module';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, PrismaService],
  imports: [ NatsModule ]
})
export class OrdersModule {}
