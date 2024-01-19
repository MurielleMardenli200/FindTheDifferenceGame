import { GameConstants, GameConstantsDocument } from '@app/model/database/game-constants.entity';
import { ConstantName } from '@common/game-constants';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class GameConstantsService {
    constructor(
        @InjectModel(GameConstants.name)
        private readonly gameConstantsModel: Model<GameConstantsDocument>,
    ) {}

    async findAll(): Promise<GameConstants> {
        const collections = await this.gameConstantsModel.db.collections;
        const collectionNames = Object.keys(collections);
        if (!collectionNames.includes('gameconstants') || (await this.gameConstantsModel.findOne().lean()) === null) {
            const defaultConstants = new this.gameConstantsModel();
            await defaultConstants.save();
            return new GameConstants(defaultConstants);
        }
        return new GameConstants(await this.gameConstantsModel.findOne().lean());
    }

    async update(constant: ConstantName, value: number): Promise<number> {
        const gameConstants = await this.gameConstantsModel.findOne();
        if (!gameConstants) {
            throw new NotFoundException('Game constants not found');
        }

        gameConstants[constant] = value;

        await gameConstants.save();

        return gameConstants[constant];
    }

    async resetToDefault(): Promise<GameConstantsDocument> {
        const selectOnlyConstantsProjection = { _id: 0, initialTime: 1, hintPenalty: 1, differenceFoundBonus: 1 };
        const defaultConstants = new GameConstants();
        await this.gameConstantsModel.updateMany({}, defaultConstants, { upsert: true, new: true });
        const updatedConstant = await this.gameConstantsModel.findOne({}, selectOnlyConstantsProjection).exec();
        return updatedConstant as GameConstantsDocument;
    }
}
