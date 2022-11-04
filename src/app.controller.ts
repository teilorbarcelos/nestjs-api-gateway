import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { RMQ_SERVER_URL } from 'env';
import { Observable } from 'rxjs';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller()
export class AppController {
  private logger = new Logger(AppController.name);
  private clientAdminBackend: ClientProxy;
  constructor() {
    this.clientAdminBackend = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [RMQ_SERVER_URL],
        queue: 'admin-backend',
      },
    });
  }

  @Post()
  @UsePipes(ValidationPipe)
  createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.clientAdminBackend.emit('create-category', createCategoryDto);
  }

  @Get('categories')
  getCategory(@Query('categoryId') categoryId: string): Observable<any> {
    return this.clientAdminBackend.send('get-category', categoryId ?? '');
  }

  @Put('categories/:_id')
  @UsePipes(ValidationPipe)
  updateCategory(
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Param('_id') _id: string,
  ) {
    this.clientAdminBackend.emit('update-category', {
      id: _id,
      category: updateCategoryDto,
    });
  }
}
