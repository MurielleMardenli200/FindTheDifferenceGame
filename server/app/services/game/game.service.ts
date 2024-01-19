import { ExistingGame, Game } from '@app/model/database/game.entity';
import { HighScore } from '@app/model/dto/high-score.dto';
import { PendingGame } from '@app/model/schema/pending-game';
import { BitmapService } from '@app/services/bitmap/bitmap.service';
import { DifferencesService } from '@app/services/differences/differences.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class GameService {
    private gameDeletedSubject: Subject<string>;
    private pendingGames: Map<string, PendingGame>;

    constructor(
        @InjectModel(Game.name) private gameModel: Model<Game>,
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
        return await this.gameModel.find();
    }

    async getGame(id: string): Promise<ExistingGame | null> {
        return await this.gameModel.findById(id);
    }

    async deleteAllGames(): Promise<void> {
        const games = await this.getGames();
        for (const game of games) {
            await this.deleteGame(game._id);
        }
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

        return await this.gameModel.create(game);
    }

    async deleteGame(id: string): Promise<void> {
        const game = await this.getGame(id);
        if (game === null) throw new HttpException('Game not found', HttpStatus.NOT_FOUND);

        this.gameDeletedSubject.next(id);

        await this.bitmapService.deleteImageFile(game.originalImageFilename);
        await this.bitmapService.deleteImageFile(game.modifiedImageFilename);
        await this.differencesService.deleteDifferences(game.differencesFilename);

        await this.gameModel.findByIdAndDelete(game._id);
    }

    async updateGame(id: string, isMultiplayer: boolean, highScores: HighScore[]): Promise<void> {
        if (isMultiplayer) await this.gameModel.findByIdAndUpdate(id, { duelHighScores: highScores });
        else await this.gameModel.findByIdAndUpdate(id, { soloHighScores: highScores });
    }
}
