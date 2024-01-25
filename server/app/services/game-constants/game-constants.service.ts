import { GameConstants } from '@app/model/database/game-constants.entity';
import { ConstantName } from '@common/game-constants';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class GameConstantsService {
    constructor(
        @InjectRepository(GameConstants)
        private readonly gameConstantsRepository: Repository<GameConstants>,
    ) {}

    async findAll(): Promise<GameConstants> {
        const constants = await this.gameConstantsRepository.findOne({});

        if (constants === null) {
            throw new NotFoundException('Game constants not found');
        }

        return constants;
    }

    async update(constant: ConstantName, value: number): Promise<number> {
        const gameConstants = await this.findAll();

        gameConstants[constant] = value;

        await this.gameConstantsRepository.save(gameConstants);

        return gameConstants[constant];
    }

    async resetToDefault(): Promise<GameConstants> {
        const defaultConstants = new GameConstants();

        await this.gameConstantsRepository.clear();

        await this.gameConstantsRepository.save(defaultConstants);

        return defaultConstants;
    }
}
