import {
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
  Body,
  Get,
  Query,
  Put,
  Param,
  Delete,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { ClientProxySmartRanking } from '../proxyrmq/client-proxy';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { Player } from 'src/players/interfaces/player.interface';
import { lastValueFrom } from 'rxjs';
import { ChallengeStatusValidationPipe } from './pipes/challenge-status-validation.pipe';
import { UpdateChallengeDto } from './dto/update-challenge.dto';
import { Challenge, Play } from './interfaces/challenge.interface';
import { ChallengeStatus } from './interfaces/challenge-status.enum';
import { AddChallengePlayDto } from './dto/add-challenge-play.dto';

@Controller('api/v1/challenges')
export class ChallengesController {
  constructor(private clientProxySmartRanking: ClientProxySmartRanking) {}

  private readonly logger = new Logger(ChallengesController.name);

  /*
        Criamos um proxy específico para lidar com o microservice
        desafios
    */
  private clientChallenge =
    this.clientProxySmartRanking.getClientProxyChallengesInstance();

  private clientAdminBackend =
    this.clientProxySmartRanking.getClientProxyAdminBackendInstance();

  @Post()
  @UsePipes(ValidationPipe)
  async createChallenge(@Body() createChallengeDto: CreateChallengeDto) {
    this.logger.log(
      `createChallengeDto: ${JSON.stringify(createChallengeDto)}`,
    );

    /*
                Validações relacionadas ao array de jogadores que participam
                do desafio
            */
    const players: Player[] = await lastValueFrom(
      this.clientAdminBackend.send('get-players', ''),
    );

    createChallengeDto.players.map((playerDto) => {
      const playerFilter: Player[] = players.filter(
        (player) => player._id == playerDto._id,
      );

      this.logger.log(`playerFilter: ${JSON.stringify(playerFilter)}`);

      /*
                    Verificamos se os jogadores do desafio estão cadastrados
                */
      if (playerFilter.length == 0) {
        throw new BadRequestException(
          `O id ${playerDto._id} não é um jogador!`,
        );
      }

      /*
                    Verificar se os jogadores fazem parte da categoria informada no
                    desafio 
                */
      if (playerFilter[0].category != createChallengeDto.category) {
        throw new BadRequestException(
          `O jogador ${playerFilter[0]._id} não faz parte da categoria informada!`,
        );
      }
    });

    /*
                Verificamos se o solicitante é um jogador da partida
            */
    const isChallengerIncluded: Player[] = createChallengeDto.players.filter(
      (player) => player._id == createChallengeDto.challenger._id,
    );

    this.logger.log(
      `isChallengerIncluded: ${JSON.stringify(isChallengerIncluded)}`,
    );

    if (isChallengerIncluded.length == 0) {
      throw new BadRequestException(
        `O solicitante deve ser um jogador da partida!`,
      );
    }

    /*
                Verificamos se a categoria está cadastrada
            */
    const category = await lastValueFrom(
      this.clientAdminBackend.send(
        'get-categories',
        createChallengeDto.category,
      ),
    );

    this.logger.log(`category: ${JSON.stringify(category)}`);

    if (!category) {
      throw new BadRequestException(`Categoria informada não existe!`);
    }

    await this.clientChallenge.emit('create-challenge', createChallengeDto);
  }

  @Get()
  async getChallenges(@Query('playerId') playerId: string): Promise<any> {
    /*
            Verificamos se o jogador informado está cadastrado
        */
    if (playerId) {
      const player: Player = await lastValueFrom(
        this.clientAdminBackend.send('get-players', playerId),
      );
      this.logger.log(`player: ${JSON.stringify(player)}`);
      if (!player) {
        throw new BadRequestException(`Jogador não cadastrado!`);
      }
    }
    /*
            No microservice desafios, o método responsável por consultar os desafios
            espera a estrutura abaixo, onde:
            - Se preenchermos o playerId a consulta de desafios será pelo id do 
            jogador informado
            - Se preenchermos o campo _id a consulta será pelo id do desafio
            - Se não preenchermos nenhum dos dois campos a consulta irá retornar
            todos os desafios cadastrados
        */
    return await lastValueFrom(
      this.clientChallenge.send('get-challenges', {
        playerId: playerId,
        _id: '',
      }),
    );
  }

  @Put('/:_id')
  async updateChallenge(
    @Body(ChallengeStatusValidationPipe) updateChallengeDto: UpdateChallengeDto,
    @Param('_id') _id: string,
  ) {
    /*
                Validações em relação ao desafio
            */

    const challenge: Challenge = await lastValueFrom(
      this.clientChallenge.send('get-challenges', { playerId: '', _id: _id }),
    );

    this.logger.log(`challenge: ${JSON.stringify(challenge)}`);

    /*
                Verificamos se o desafio está cadastrado
            */
    if (!challenge) {
      throw new BadRequestException(`Desafio não cadastrado!`);
    }

    /*
                Somente podem ser atualizados desafios com status PENDENTE
            */
    if (challenge.status != ChallengeStatus.PENDING) {
      throw new BadRequestException(
        'Somente desafios com status PENDENTE podem ser atualizados!',
      );
    }

    await this.clientChallenge.emit('update-challenge', {
      id: _id,
      challenge: updateChallengeDto,
    });
  }

  @Post('/:challenge_id/play')
  async addChallengePlay(
    @Body(ValidationPipe) addChallengePlayDto: AddChallengePlayDto,
    @Param('challenge_id') challenge_id: string,
  ) {
    const challenge: Challenge = await lastValueFrom(
      this.clientChallenge.send('get-challenges', {
        playerId: '',
        _id: challenge_id,
      }),
    );

    this.logger.log(`challenge: ${JSON.stringify(challenge)}`);

    /*
            Verificamos se o desafio está cadastrado
        */
    if (!challenge) {
      throw new BadRequestException(`Desafio não cadastrado!`);
    }

    /*
            Verificamos se o desafio já foi realizado
        */

    if (challenge.status == ChallengeStatus.DONE) {
      throw new BadRequestException(`Desafio já realizado!`);
    }

    /*
            Somente deve ser possível lançar uma partida para um desafio
            com status ACEITO
        */

    if (challenge.status != ChallengeStatus.ACCEPTED) {
      throw new BadRequestException(
        `Partidas somente podem ser lançadas em desafios aceitos pelos adversários!`,
      );
    }

    /*
            Verificamos se o jogador informado faz parte do desafio
        */
    if (!challenge.players.includes(addChallengePlayDto.def)) {
      throw new BadRequestException(
        `O jogador vencedor da partida deve fazer parte do desafio!`,
      );
    }

    /*
            Criamos nosso objeto partida, que é formado pelas
            informações presentes no Dto que recebemos e por informações
            presentes no objeto desafio que recuperamos 
        */
    const play: Play = {} as Play;
    play.category = challenge.category;
    play.def = addChallengePlayDto.def;
    play.challenge = challenge_id;
    play.players = challenge.players;
    play.result = addChallengePlayDto.result;

    /*
            Enviamos a partida para o tópico 'criar-partida'
            Este tópico é responsável por persitir a partida na 
            collection Partidas
        */
    await this.clientChallenge.emit('create-play', play);
  }

  @Delete('/:_id')
  async deleteChallenge(@Param('_id') _id: string) {
    const challenge: Challenge = await lastValueFrom(
      this.clientChallenge.send('get-challenges', { playerId: '', _id: _id }),
    );

    this.logger.log(`challenge: ${JSON.stringify(challenge)}`);

    /*
            Verificamos se o desafio está cadastrado
        */
    if (!challenge) {
      throw new BadRequestException(`Desafio não cadastrado!`);
    }

    await this.clientChallenge.emit('delete-challenge', challenge);
  }
}
