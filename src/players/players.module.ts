import { Module } from '@nestjs/common';
import { AwsModule } from 'src/aws/aws.module';
import { ProxyRMQModule } from '../proxyrmq/proxyrmq.module';
import { PlayersController } from './players.controller';

@Module({
  imports: [ProxyRMQModule],
  controllers: [PlayersController],
  providers: [AwsModule],
})
export class PlayersModule {}
