import { ExistingGame, Game, GameDocument, gameSchema } from '@app/model/database/game.entity';
import { defaultGame, defaultPendingGame } from '@app/samples/game';
import { BitmapService } from '@app/services/bitmap/bitmap.service';
import { DifferencesService } from '@app/services/differences/differences.service';
import { getConnectionToken, getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model } from 'mongoose';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { GameService } from './game.service';

const DELAY_BEFORE_CLOSING_CONNECTION = 200;

describe('GameService', () => {
    let service: GameService;
    let gameModel: Model<GameDocument>;
    let mongoServer: MongoMemoryServer;
    let connection: Connection;
    let bitmapService: SinonStubbedInstance<BitmapService>;
    let differencesService: SinonStubbedInstance<DifferencesService>;

    beforeEach(async () => {
        mongoServer = await MongoMemoryServer.create();
        bitmapService = createStubInstance(BitmapService);
        differencesService = createStubInstance(DifferencesService);

        const module = await Test.createTestingModule({
            imports: [
                MongooseModule.forRootAsync({
                    useFactory: () => ({
                        uri: mongoServer.getUri(),
                    }),
                }),
                MongooseModule.forFeature([{ name: Game.name, schema: gameSchema }]),
            ],
            providers: [
                GameService,
                { provide: BitmapService, useValue: bitmapService },
                { provide: DifferencesService, useValue: differencesService },
            ],
        }).compile();

        service = module.get<GameService>(GameService);
        gameModel = module.get<Model<GameDocument>>(getModelToken(Game.name));
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
        expect(gameModel).toBeDefined();
    });

    it('getTemporaryGame() should return a temporary game by id', async () => {
        service['pendingGames'].set('1234', defaultPendingGame);
        expect(service.getTemporaryGame('1234')).toEqual(defaultPendingGame);
    });

    it('getTemporaryGame() should return undefined if the temporary game does not exist', async () => {
        expect(service.getTemporaryGame('5678')).toBe(undefined);
    });

    it('createTemporaryGame() should create a new temporary game', async () => {
        service.createTemporaryGame('1234', defaultPendingGame);
        expect(service['pendingGames'].get('1234')).toEqual(defaultPendingGame);
    });

    it('deleteTemporaryGame() should delete a temporary game', async () => {
        service['pendingGames'].set('1234', defaultPendingGame);
        service.deleteTemporaryGame('1234');
        expect(service['pendingGames'].get('1234')).toBe(undefined);
    });

    it('getGames() should return all games', async () => {
        await gameModel.deleteMany({});
        await gameModel.create(
            { ...defaultGame, name: 'game1', _id: 'abcdefabcdef1234567890aa' },
            { ...defaultGame, name: 'game2', _id: 'abcdefabcdef1234567890ab' },
            { ...defaultGame, name: 'game3', _id: 'abcdefabcdef1234567890ac' },
        );
        expect((await service.getGames()).length).toEqual(3);
    });

    it('createGame() should create a new game', async () => {
        await gameModel.deleteMany({});
        bitmapService.saveImage.resolves('1234.bmp');
        differencesService.saveDifferences.resolves('1234.json');
        await service.createGame(defaultPendingGame, 'thisgame');
        expect(await gameModel.countDocuments()).toEqual(1);
        expect(bitmapService.saveImage.calledWith(defaultPendingGame.originalImageBase64)).toBe(true);
        expect(bitmapService.saveImage.calledWith(defaultPendingGame.modifiedImageBase64)).toBe(true);
        expect(differencesService.saveDifferences.calledWith(defaultPendingGame.differences)).toBe(true);
    });

    it('getGame() should return a game by id', async () => {
        await gameModel.deleteMany({});
        const document = await gameModel.create(defaultGame);
        expect((await service.getGame(document._id))?._id).toEqual(document._id);
    });

    it('getGame() should return null if game does not exist', async () => {
        await gameModel.deleteMany({});
        expect(await service.getGame('012345678901234567891234')).toBe(null);
    });

    it('deleteGame() should delete the game', async () => {
        await gameModel.deleteMany({});
        const document = await gameModel.create(defaultGame);
        const getGameSpy = jest.spyOn(service, 'getGame').mockImplementation(async () => document);

        await service.deleteGame(document._id);
        expect(await gameModel.countDocuments()).toEqual(0);
        expect(getGameSpy).toBeCalledWith(document._id);
    });

    it('deleteAllGames() should delete all the games', async () => {
        await gameModel.deleteMany({});
        const document: ExistingGame[] | PromiseLike<ExistingGame[]>[] = await gameModel.create(
            { ...defaultGame, name: 'game1', _id: 'abcdefabcdef1234567890aa' },
            { ...defaultGame, name: 'game2', _id: 'abcdefabcdef1234567890ab' },
            { ...defaultGame, name: 'game3', _id: 'abcdefabcdef1234567890ac' },
        );
        const getGamesSpy = jest.spyOn(service, 'getGames').mockImplementation(async () => document);

        await service.deleteAllGames();
        expect(await gameModel.countDocuments()).toEqual(0);
        expect(getGamesSpy).toBeCalledWith();
    });

    it('deleteGame() should throw an error if game does not exist', async () => {
        await gameModel.deleteMany({});
        const getGameSpy = jest.spyOn(service, 'getGame').mockImplementation(async () => null);

        await expect(service.deleteGame('012345678901234567891234')).rejects.toThrow();
        expect(await gameModel.countDocuments()).toEqual(0);
        expect(getGameSpy).toBeCalledWith('012345678901234567891234');
    });
});
