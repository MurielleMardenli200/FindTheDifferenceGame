import { GameConstants, GameConstantsDocument } from '@app/model/database/game-constants.entity';
import { GameConstantsService } from '@app/services/game-constants/game-constants.service';
import { GameHistoryService } from '@app/services/game-history/game-history.service';
import { ConstantName } from '@common/game-constants';
import { History } from '@common/model/history';
import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Put,
    UseGuards,
    UseInterceptors,
    ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Game Constants')
@Controller('configuration')
export class ConfigurationController {
    constructor(private readonly gameConstantsService: GameConstantsService, private readonly gameHistoryService: GameHistoryService) {}

    @UseInterceptors(ClassSerializerInterceptor)
    @ApiOperation({ summary: 'Get game constants' })
    @ApiBearerAuth('access-token')
    @UseGuards(AuthGuard('jwt'))
    @Get('/constants')
    async findAll(): Promise<GameConstants> {
        return await this.gameConstantsService.findAll();
    }

    @ApiOperation({ summary: 'Reset game constants' })
    @ApiBearerAuth('access-token')
    @UseGuards(AuthGuard('jwt'))
    @Put('constants/reset')
    async resetToDefault(): Promise<GameConstantsDocument> {
        return await this.gameConstantsService.resetToDefault();
    }

    @ApiOperation({ summary: 'Update game constants' })
    @ApiBearerAuth('access-token')
    @UseGuards(AuthGuard('jwt'))
    @Patch('constants/:constant')
    async update(@Param('constant') constant: ConstantName, @Body('value', ValidationPipe) value: number): Promise<number> {
        return await this.gameConstantsService.update(constant, value);
    }

    @ApiOperation({ summary: 'Get game history' })
    @ApiBearerAuth('access-token')
    @UseGuards(AuthGuard('jwt'))
    @Get('/history')
    async getHistory(): Promise<History[]> {
        return await this.gameHistoryService.getHistory();
    }

    @ApiOperation({ summary: 'Delete game history' })
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('access-token')
    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete('/history')
    async deleteHistory(): Promise<void> {
        return await this.gameHistoryService.deleteHistory();
    }
}
