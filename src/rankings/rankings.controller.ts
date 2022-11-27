import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ClientProxySmartRanking } from 'src/proxyrmq/client-proxy';

@Controller('api/v1/rankings')
export class RankingsController {
  constructor(private clientProxySmartRanking: ClientProxySmartRanking) {}

  private clientRankingsBackend =
    this.clientProxySmartRanking.getClientProxyRankingsInstance();

  @Get()
  getRankings(
    @Query('categoryId') categoryId: string,
    @Query('dataRef') dataRef: string,
  ): Observable<any> {
    if (!categoryId) {
      throw new BadRequestException('O ID da categoria não foi informado!');
    }

    return this.clientRankingsBackend.send('get-rankings', {
      categoryId: categoryId,
      dataRef: dataRef ? dataRef : '',
    });
  }
}
