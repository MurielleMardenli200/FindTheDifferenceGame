import { ExistingGame } from '@app/model/database/game.entity';
import { GameService } from '@app/services/game/game.service';
import { ClassSerializerInterceptor, Controller, Delete, Get, HttpCode, UseGuards, HttpStatus, Param, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { AccessAuthGuard } from '@app/authentication/access.guard';

@ApiTags('Games')
@Controller('game')
@ApiHeader({ name: 'username' })
@ApiBearerAuth('access-token')
@UseGuards(AccessAuthGuard)
export class GameController {
    constructor(private readonly gameService: GameService) {}

    @UseInterceptors(ClassSerializerInterceptor)
    @ApiOperation({ summary: 'Get all games' })
    @Get('/')
    async getGames(): Promise<ExistingGame[]> {
        return await this.gameService.getGames();
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
