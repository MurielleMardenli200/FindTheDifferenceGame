/* eslint-disable @typescript-eslint/no-magic-numbers */
import { GameConstants } from '@app/model/database/game-constant.entity';
import { DEFAULT_GAME_CONSTANTS, mockHistory } from '@app/samples/game-session';
import { GameConstantsService } from '@app/services/game-constants/game-constants.service';
import { GameHistoryService } from '@app/services/game-history/game-history.service';
import { History } from '@common/model/history';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { ConfigurationController } from './configuration.controller';

describe('ConfigurationController', () => {
    let controller: ConfigurationController;
    let gameConstantsService: SinonStubbedInstance<GameConstantsService>;
    let gameHistoryService: SinonStubbedInstance<GameHistoryService>;

    beforeEach(async () => {
        gameConstantsService = createStubInstance(GameConstantsService);
        gameHistoryService = createStubInstance(GameHistoryService);

        const module: TestingModule = await Test.createTestingModule({
            controllers: [ConfigurationController],
            providers: [
                { provide: GameConstantsService, useValue: gameConstantsService },
                {
                    provide: GameHistoryService,
                    useValue: gameHistoryService,
                },
            ],
        }).compile();

        controller = module.get(ConfigurationController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('findAll() should return all constants', async () => {
        const constants: GameConstants = DEFAULT_GAME_CONSTANTS;
        gameConstantsService.getAll().resolves(constants);

        expect(await controller.findAll()).toEqual(constants);
    });

    it('resetToDefault() should reset constants to default', async () => {
        await controller.resetToDefault();
        expect(gameConstantsService.resetToDefault.calledOnce).toBe(true);
    });

    it('update() should update constant', async () => {
        await controller.update('differenceFoundBonus', 10);
        expect(gameConstantsService.update.calledWith('differenceFoundBonus', 10)).toBe(true);
    });

    it('getHistory should return the game history', async () => {
        const history: History[] = mockHistory;
        gameHistoryService.getHistory.resolves(history);

        expect(await controller.getHistory()).toEqual(history);
    });

    it('deleteHistory should delete the game history', async () => {
        await controller.deleteHistory();
        expect(gameHistoryService.deleteHistory.calledOnce).toBe(true);
    });
});
