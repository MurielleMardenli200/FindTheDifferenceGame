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
    UseInterceptors,
    ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Game Constants')
@Controller('configuration')
export class ConfigurationController {
    constructor(private readonly gameConstantsService: GameConstantsService, private readonly gameHistoryService: GameHistoryService) {}

    @UseInterceptors(ClassSerializerInterceptor)
    @ApiOperation({ summary: 'Get game constants' })
    @Get('/constants')
    async findAll(): Promise<GameConstants> {
        return await this.gameConstantsService.findAll();
    }

    @ApiOperation({ summary: 'Reset game constants' })
    @Put('constants/reset')
    async resetToDefault(): Promise<GameConstantsDocument> {
        return await this.gameConstantsService.resetToDefault();
    }

    @ApiOperation({ summary: 'Update game constants' })
    @Patch('constants/:constant')
    async update(@Param('constant') constant: ConstantName, @Body('value', ValidationPipe) value: number): Promise<number> {
        return await this.gameConstantsService.update(constant, value);
    }

    @ApiOperation({ summary: 'Get game history' })
    @Get('/history')
    async getHistory(): Promise<History[]> {
        return await this.gameHistoryService.getHistory();
    }

    @ApiOperation({ summary: 'Delete game history' })
    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete('/history')
    async deleteHistory(): Promise<void> {
        return await this.gameHistoryService.deleteHistory();
    }
}
