import { Module } from '@nestjs/common';
import { ProxyRMQModule } from 'src/proxyrmq/proxyrmq.module';
import { ChallengesController } from './challenges.controller';

@Module({
  imports: [ProxyRMQModule],
  controllers: [ChallengesController],
})
export class ChallengesModule {}
