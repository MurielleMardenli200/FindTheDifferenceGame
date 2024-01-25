import { ExistingGame, Game } from '@app/model/database/game.entity';
import { HighScore } from '@app/model/dto/high-score.dto';
import { PendingGame } from '@app/model/schema/pending-game';
import { BitmapService } from '@app/services/bitmap/bitmap.service';
import { DifferencesService } from '@app/services/differences/differences.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Observable, Subject } from 'rxjs';
import { Repository } from 'typeorm';

@Injectable()
export class GameService {
    private gameDeletedSubject: Subject<string>;
    private pendingGames: Map<string, PendingGame>;

    constructor(
        @InjectRepository(Game) private gameRepository: Repository<Game>,
        private bitmapService: BitmapService,
        private differencesService: DifferencesService,
    ) {
        this.pendingGames = new Map<string, PendingGame>();
        this.gameDeletedSubject = new Subject();
    }

    get gameDeletedObservable(): Observable<string> {
        return this.gameDeletedSubject.asObservable();
    }

    getTemporaryGame(id: string): PendingGame | undefined {
        return this.pendingGames.get(id);
    }

    createTemporaryGame(id: string, pendingGame: PendingGame): void {
        this.pendingGames.set(id, pendingGame);
    }

    deleteTemporaryGame(id: string): void {
        this.pendingGames.delete(id);
    }

    async getGames(): Promise<ExistingGame[]> {
        return await this.gameRepository.find();
    }

    async getGame(id: string): Promise<ExistingGame | null> {
        return await this.gameRepository.findOne({
            where: {
                _id: id
            },
        });
    }

    async deleteAllGames(): Promise<void> {
        await this.gameRepository.clear();
    }

    async createGame(pendingGame: PendingGame, name: string): Promise<ExistingGame> {
        const originalImageFilename = await this.bitmapService.saveImage(pendingGame.originalImageBase64);
        const modifiedImageFilename = await this.bitmapService.saveImage(pendingGame.modifiedImageBase64);
        const differencesFilename = await this.differencesService.saveDifferences(pendingGame.differences);
        const game: Game = new Game(pendingGame.temporaryGame, {
            name,
            originalImageFilename,
            modifiedImageFilename,
            differencesFilename,
            differencesCount: pendingGame.differences.length,
        });

        return await this.gameRepository.save(game);
    }

    async deleteGame(id: string): Promise<void> {
        const game = await this.getGame(id);
        if (game === null) throw new HttpException('Game not found', HttpStatus.NOT_FOUND);

        this.gameDeletedSubject.next(id);

        await this.bitmapService.deleteImageFile(game.originalImageFilename);
        await this.bitmapService.deleteImageFile(game.modifiedImageFilename);
        await this.differencesService.deleteDifferences(game.differencesFilename);

        await this.gameRepository.delete(game);
    }

    async updateGame(id: string, isMultiplayer: boolean, highScores: HighScore[]): Promise<void> {
        const game = await this.getGame(id);
        if (isMultiplayer) await this.gameRepository.save({ ...game, duelHighScores: highScores });
        else await this.gameRepository.save({ ...game, soloHighScores: highScores });
    }
}
