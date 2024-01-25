/* eslint-disable @typescript-eslint/no-magic-numbers */
import { GameConstants, GameConstantsDocument, gameConstantsSchema } from '@app/model/database/game-constant.entity';
import { GameConstantsService } from '@app/services/game-constants/game-constants.service';
import { MongooseModule, getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model } from 'mongoose';

const DELAY_BEFORE_CLOSING_CONNECTION = 200;

describe('GameConstantsService', () => {
    let service: GameConstantsService;
    let constantsModel: Model<GameConstantsDocument>;
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
                MongooseModule.forFeature([{ name: GameConstants.name, schema: gameConstantsSchema }]),
            ],
            providers: [GameConstantsService],
        }).compile();

        service = module.get<GameConstantsService>(GameConstantsService);
        constantsModel = module.get<Model<GameConstantsDocument>>(getModelToken(GameConstants.name));
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
        expect(constantsModel).toBeDefined();
    });

    it('findAll() should return current game constants if they exist', async () => {
        constantsModel.deleteMany({});
        const constants = new GameConstants({
            differenceFoundBonus: 10,
            hintPenalty: 5,
            initialTime: 60,
        });
        await constantsModel.create(constants);
        const result = await service.getAll()();
        expect(result).toEqual(constants);
    });

    it('findAll() should return default game constants if they do not exist', async () => {
        constantsModel.deleteMany({});
        const result = await service.getAll()();
        expect(result).toEqual(new GameConstants());
        expect(constantsModel.countDocuments()).resolves.toBe(1);
    });

    it('update() should update game constant', async () => {
        constantsModel.deleteMany({});
        const constants = new GameConstants({
            differenceFoundBonus: 10,
            hintPenalty: 5,
            initialTime: 60,
        });
        await constantsModel.create(constants);
        await service.update('hintPenalty', 20);
        const result = await service.getAll()();
        expect(result.hintPenalty).toEqual(20);
    });

    it("update() should throw an error if the constants don't exist", async () => {
        constantsModel.deleteMany({});
        await expect(service.update('hintPenalty', 20)).rejects.toThrowError();
    });

    it('resetToDefault() should reset game constants to default', async () => {
        constantsModel.deleteMany({});
        const constants = new GameConstants({
            differenceFoundBonus: 10,
            hintPenalty: 5,
            initialTime: 60,
        });
        await constantsModel.create(constants);
        await service.resetToDefault();
        const result = await service.getAll()();
        expect(result).toEqual(new GameConstants());
    });
});
