import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RABBITMQ_PASSWORD, RABBITMQ_USER, RMQ_SERVER_URL } from 'env';

@Injectable()
export class ClientProxySmartRanking {
  constructor(private configService: ConfigService) {}

  getClientProxyAdminBackendInstance(): ClientProxy {
    return ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [
          `amqp://${this.configService.get<string>(
            RABBITMQ_USER,
          )}:${this.configService.get<string>(
            RABBITMQ_PASSWORD,
          )}@${this.configService.get<string>(RMQ_SERVER_URL)}`,
        ],
        queue: 'admin-backend',
      },
    });
  }

  getClientProxyDesafiosInstance(): ClientProxy {
    return ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [
          `amqp://${this.configService.get<string>(
            RABBITMQ_USER,
          )}:${this.configService.get<string>(
            RABBITMQ_PASSWORD,
          )}@${this.configService.get<string>(RMQ_SERVER_URL)}`,
        ],
        queue: 'desafios',
      },
    });
  }

  getClientProxyRankingsInstance(): ClientProxy {
    return ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [
          `amqp://${this.configService.get<string>(
            RABBITMQ_USER,
          )}:${this.configService.get<string>(
            RABBITMQ_PASSWORD,
          )}@${this.configService.get<string>(RMQ_SERVER_URL)}`,
        ],
        queue: 'rankings',
      },
    });
  }
}
