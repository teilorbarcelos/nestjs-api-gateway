import {
  Controller,
  Get,
  Logger,
  Post,
  UsePipes,
  ValidationPipe,
  Body,
  Query,
  Put,
  Param,
  BadRequestException,
  Delete,
  Req,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ClientProxySmartRanking } from '../proxyrmq/client-proxy';
import { Request } from 'express';
import { CreatePlayerDto } from './dto/create-player.dto';
import { Category } from 'src/categories/interfaces/category.interface';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { ValidationParamsPipe } from 'src/common/pipes/validation-params.pipe';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('api/v1/jogadores')
export class PlayersController {
  private logger = new Logger(PlayersController.name);

  constructor(private clientProxySmartRanking: ClientProxySmartRanking) {}

  private clientAdminBackend =
    this.clientProxySmartRanking.getClientProxyAdminBackendInstance();

  @Post()
  @UsePipes(ValidationPipe)
  async criarJogador(@Body() createPlayerDto: CreatePlayerDto) {
    this.logger.log(`criarJogadorDto: ${JSON.stringify(createPlayerDto)}`);

    const category: Category = await this.clientAdminBackend
      .send('get-categories', createPlayerDto.category)
      .toPromise();

    if (category) {
      await this.clientAdminBackend.emit('create-player', createPlayerDto);
    } else {
      throw new BadRequestException(`Categoria não cadastrada!`);
    }
  }

  @Post('/:_id/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: File, @Param('id') id: string) {
    this.logger.log(file);
  }

  @Get()
  getPlayers(
    @Req() req: Request,
    @Query('idPlayer') _id: string,
  ): Observable<any> {
    // this.logger.log(`req: ${JSON.stringify(req.user)}`);
    return this.clientAdminBackend.send('get-players', _id ? _id : '');
  }

  @Put('/:_id')
  @UsePipes(ValidationPipe)
  async updatePlayer(
    @Body() updatePlayerDto: UpdatePlayerDto,
    @Param('_id', ValidationParamsPipe) _id: string,
  ) {
    const category: Category = await this.clientAdminBackend
      .send('get-categories', updatePlayerDto.category)
      .toPromise();

    if (category) {
      await this.clientAdminBackend.emit('update-player', {
        id: _id,
        jogador: updatePlayerDto,
      });
    } else {
      throw new BadRequestException(`Categoria não cadastrada!`);
    }
  }

  @Delete('/:_id')
  async deletarJogador(@Param('_id', ValidationParamsPipe) _id: string) {
    await this.clientAdminBackend.emit('delete-player', { _id });
  }
}
