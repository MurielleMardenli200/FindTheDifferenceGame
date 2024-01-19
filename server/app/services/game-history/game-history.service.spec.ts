/* eslint-disable @typescript-eslint/no-magic-numbers */
import { gameHistorySchema, History } from '@app/model/database/game-history.entity';
import { GameMode } from '@common/game-mode';
import { getConnectionToken, getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model } from 'mongoose';
import { GameHistoryService } from './game-history.service';

const DELAY_BEFORE_CLOSING_CONNECTION = 200;

describe('GameHistoryService', () => {
    let service: GameHistoryService;
    let gameHistoryModel: Model<History>;
    let mongoServer: MongoMemoryServer;
    let connection: Connection;

    beforeEach(async () => {
        mongoServer = await MongoMemoryServer.create();

        const module: TestingModule = await Test.createTestingModule({
            imports: [
                MongooseModule.forRootAsync({
                    useFactory: () => ({
                        uri: mongoServer.getUri(),
                    }),
                }),
                MongooseModule.forFeature([{ name: History.name, schema: gameHistorySchema }]),
            ],
            providers: [GameHistoryService],
        }).compile();

        service = module.get<GameHistoryService>(GameHistoryService);
        gameHistoryModel = module.get<Model<History>>(getModelToken(History.name));
        connection = await module.get(getConnectionToken());
    });

    afterEach((done) => {
        setTimeout(async () => {
            await connection.close();
            await mongoServer.stop();
            done();
        }, DELAY_BEFORE_CLOSING_CONNECTION);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
        expect(gameHistoryModel).toBeDefined();
    });

    it('getHistory should get history', async () => {
        const findSpy = jest.spyOn(gameHistoryModel, 'find');
        await service.getHistory();
        expect(findSpy).toHaveBeenCalled();
    });

    it('deleteHistory, should delete all histories', async () => {
        await gameHistoryModel.create([
            { gameStart: 100, gameTime: 20, gameMode: GameMode.ClassicSolo, players: ['tester'], _id: 'abcdefabcdef1234567890aa' },
            { gameStart: 110, gameTime: 25, gameMode: GameMode.ClassicSolo, players: ['tester2'], _id: 'abcdefabcdef1234567890ab' },
        ]);
        await service.deleteHistory();
        expect(await gameHistoryModel.countDocuments()).toEqual(0);
    });

    it('createGameHistory should create a game history', async () => {
        const history = {
            gameStart: Date.now(),
            gameTime: 20,
            gameMode: GameMode.ClassicSolo,
            players: ['tester'],
        };
        await service.createGameHistory(history);
        expect(await gameHistoryModel.countDocuments()).toEqual(1);
    });
});
