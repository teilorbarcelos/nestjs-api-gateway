import { Module } from '@nestjs/common';
import { CategoriesModule } from './categories/categories.module';
import { PlayersModule } from './players/players.module';
import { AwsModule } from './aws/aws.module';

@Module({
  imports: [CategoriesModule, PlayersModule, AwsModule],
  providers: [],
})
export class AppModule {}
