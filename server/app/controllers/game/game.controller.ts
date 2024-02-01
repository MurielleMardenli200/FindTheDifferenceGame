import { ExistingGame } from '@app/model/database/game.entity';
import { GameService } from '@app/services/game/game.service';
import { ClassSerializerInterceptor, Controller, Delete, Get, HttpCode, UseGuards, HttpStatus, Param, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Games')
@Controller('game')
export class GameController {
    constructor(private readonly gameService: GameService) {}

    @UseInterceptors(ClassSerializerInterceptor)
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Get all games' })
    @Get('/')
    async getGames(): Promise<ExistingGame[]> {
        return await this.gameService.getGames();
    }

    @ApiOperation({ summary: 'Delete a game' })
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('access-token')
    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete('/:id')
    async deleteGame(@Param('id') id: string): Promise<void> {
        await this.gameService.deleteGame(id);
    }

    @ApiOperation({ summary: 'Delete all game' })
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('access-token')
    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete()
    async deleteAllGame(): Promise<void> {
        await this.gameService.deleteAllGames();
    }
}
