import { Module } from '@nestjs/common';
import { CategoriesModule } from './categories/categories.module';
import { PlayersModule } from './players/players.module';

@Module({
  imports: [CategoriesModule, PlayersModule],
  providers: [],
})
export class AppModule {}
