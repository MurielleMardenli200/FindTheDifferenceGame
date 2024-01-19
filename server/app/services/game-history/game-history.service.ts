import { History } from '@app/model/database/game-history.entity';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class GameHistoryService {
    constructor(@InjectModel(History.name) private historyModel: Model<History>) {}

    async getHistory(): Promise<History[]> {
        return await this.historyModel.find();
    }

    async deleteHistory(): Promise<void> {
        await this.historyModel.deleteMany();
    }

    async createGameHistory(history: History): Promise<void> {
        const gameHistory = new History(history);
        await this.historyModel.create(gameHistory);
    }
}
