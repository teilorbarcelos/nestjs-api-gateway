import { Module } from '@nestjs/common';
import { CategoriesModule } from './categories/categories.module';
import { PlayersModule } from './players/players.module';
import { AwsModule } from './aws/aws.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    CategoriesModule,
    PlayersModule,
    AwsModule,
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  providers: [],
})
export class AppModule {}
