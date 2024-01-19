import { ExistingGame, Game } from '@app/model/database/game.entity';
import { GameService } from '@app/services/game/game.service';
import { ClassSerializerInterceptor, Controller, Delete, Get, HttpCode, HttpStatus, Param, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Games')
@Controller('game')
export class GameController {
    constructor(private readonly gameService: GameService) {}

    @UseInterceptors(ClassSerializerInterceptor)
    @ApiOperation({ summary: 'Get all games' })
    @Get('/')
    async getGames(): Promise<ExistingGame[]> {
        const games = (await this.gameService.getGames()).map((game) => new Game(game) as ExistingGame);
        return games;
    }

    @ApiOperation({ summary: 'Delete a game' })
    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete('/:id')
    async deleteGame(@Param('id') id: string): Promise<void> {
        await this.gameService.deleteGame(id);
    }

    @ApiOperation({ summary: 'Delete all game' })
    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete()
    async deleteAllGame(): Promise<void> {
        await this.gameService.deleteAllGames();
    }
}
