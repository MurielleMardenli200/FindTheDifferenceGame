import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ActionModalData } from '@app/components/action-modal/action-modal.component';
import { ErrorModalComponent } from '@app/components/error-modal/error-modal.component';
import { UserNameComponent } from '@app/components/user-name/user-name.component';
import { ButtonState } from '@app/enums/button-state';
import { GameInfo } from '@app/interfaces/game-info';
import { LoadingModalRef, ModalService } from '@app/services/modal/modal.service';
import { SocketService } from '@app/services/socket/socket.service';
import { CancelGameResponse } from '@common/cancel-game-responses';
import { GameMode } from '@common/game-mode';
import { GameSessionEvent } from '@common/game-session.events';
import { CreateClassicGameSessionDto, CreateGameSessionDto, CreateTimeLimitedGameSessionDto } from '@common/model/dto/create-game-session';
import { GameSheetState } from '@common/model/game';
import { GameInfo as CommonGameInfo } from '@common/model/game-info';
import { NewOpponentInfo } from '@common/model/new-opponent-info';
import { WaitingRoomStatus } from '@common/model/waiting-room-status';
import { GlobalEvent } from '@common/socket-event';

@Injectable({
    providedIn: 'root',
})
export class GameStartService {
    private _gameInfo: GameInfo | null = null;

    private username: string = '';
    private gameMode: GameMode = GameMode.ClassicSolo;
    private onExceptionCallbacks: (() => void)[] = [];

    // Used to inject the required services
    // eslint-disable-next-line max-params
    constructor(private modal: MatDialog, private socketService: SocketService, private modalService: ModalService, private router: Router) {
        this.setupEventListeners();
    }

    get gameInfo(): GameInfo | null {
        const gameInfo = this._gameInfo;
        this._gameInfo = null;
        return gameInfo;
    }

    async startSoloGame(gameId?: string) {
        if (!gameId) {
            await this.startGame(GameMode.TimeLimitedSolo, ButtonState.Play);
        } else {
            await this.startGame(GameMode.ClassicSolo, ButtonState.Play, gameId);
        }
    }

    async startMultiplayerGame(gameSheetState?: GameSheetState, gameId?: string) {
        if (!gameId) {
            await this.startGame(GameMode.TimeLimitedCoop, ButtonState.Play);
            return;
        }
        const gameMode = GameMode.ClassicOneVersusOne;
        const buttonState = gameSheetState === GameSheetState.Creatable ? ButtonState.Create : ButtonState.Join;
        await this.startGame(gameMode, buttonState, gameId);
    }

    private setupEventListeners() {
        this.socketService.on(GlobalEvent.Exception, () => {
            this.onExceptionCallbacks.forEach((callback) => callback());
            this.modal.open(ErrorModalComponent);
        });

        this.socketService.on<NewOpponentInfo>(GameSessionEvent.NewOpponent, ({ username, socketId }) => {
            const modalData: ActionModalData = {
                title: 'Acceptation du joueur',
                message: `Le joueur ${username} souhaite jouer avec vous. Acceptez-vous ?`,
                actions: [
                    {
                        label: 'ACCEPTER',
                        callback: () => this.acceptOpponent(socketId),
                        close: true,
                    },
                    {
                        label: 'REFUSER',
                        callback: () => this.rejectOpponent(socketId),
                        close: true,
                    },
                ],
            };

            this.modalService.createActionModal(modalData);
        });

        this.socketService.on(GameSessionEvent.GameSessionCanceled, (response: CancelGameResponse) => {
            this.modal.closeAll();
            this.modalService.createInformationModal('Partie annulée', response).then((wasModalClosedByUser: number | undefined) => {
                if (response !== CancelGameResponse.OpponentLeft || wasModalClosedByUser !== 0) return;
                this.showWaitingModal(WaitingRoomStatus.Created);
            });
        });

        this.socketService.on(GameSessionEvent.GameStart, (gameInfo: CommonGameInfo) => {
            this.modal.closeAll();
            this._gameInfo = {
                game: gameInfo.game,
                gameMode: this.gameMode,
                username: this.username,
                initialTime: gameInfo.initialTime,
                hintPenalty: gameInfo.hintPenalty,
                differenceFoundBonus: gameInfo.differenceFoundBonus,
            };
            if (this._gameInfo.gameMode === GameMode.ClassicOneVersusOne || this._gameInfo.gameMode === GameMode.TimeLimitedCoop) {
                this._gameInfo.otherPlayerUsername = gameInfo.usernames.find((username) => username !== this._gameInfo?.username);
            }
            if (this._gameInfo.gameMode === GameMode.ClassicSolo || this._gameInfo.gameMode === GameMode.ClassicOneVersusOne) {
                this.router.navigate(['/classic']);
            } else {
                this.router.navigate(['/time-limited']);
            }
        });
    }

    private acceptOpponent(socketId: string) {
        this.socketService.send(GameSessionEvent.AcceptOpponent, { socketId });
        const loadingModal = this.modalService.createLoadingModal();
        this.onExceptionCallbacks.push(() => loadingModal.close());
    }

    private rejectOpponent(socketId: string) {
        this.socketService.send(GameSessionEvent.RejectOpponent, { socketId });
    }

    private async getUsername(buttonState: ButtonState): Promise<string | undefined> {
        return new Promise<string | undefined>((resolve) => {
            this.modal
                .open(UserNameComponent, { data: { state: buttonState } })
                .afterClosed()
                .subscribe((username: string | undefined) => {
                    resolve(username);
                });
        });
    }

    private async startGame(gameMode: GameMode, buttonState: ButtonState, gameId?: string) {
        const username = await this.getUsername(buttonState);
        if (!username) return;
        this.username = username;
        this.gameMode = gameMode;
        let loadingModal: LoadingModalRef;
        let createGameSessionDto: CreateGameSessionDto;
        switch (gameMode) {
            case GameMode.ClassicSolo:
                if (!gameId) return;
                createGameSessionDto = {
                    gameId,
                    gameMode,
                    username,
                };
                this.socketService.send<CreateClassicGameSessionDto>(GameSessionEvent.StartGameSession, createGameSessionDto);
                this.modalService.createLoadingModal();

                break;

            case GameMode.ClassicOneVersusOne:
                if (!gameId) return;
                createGameSessionDto = {
                    gameId,
                    gameMode,
                    username,
                };
                loadingModal = this.modalService.createLoadingModal();
                this.socketService.send<CreateClassicGameSessionDto, WaitingRoomStatus>(
                    GameSessionEvent.StartGameSession,
                    createGameSessionDto,
                    (waitingStatus) => {
                        loadingModal.close();
                        this.showWaitingModal(waitingStatus);
                    },
                );
                break;

            case GameMode.TimeLimitedSolo:
                createGameSessionDto = {
                    gameMode,
                    username,
                };
                loadingModal = this.modalService.createLoadingModal();
                this.socketService.send<CreateTimeLimitedGameSessionDto>(GameSessionEvent.StartGameSession, createGameSessionDto);
                break;

            case GameMode.TimeLimitedCoop:
                createGameSessionDto = {
                    gameMode,
                    username,
                };
                loadingModal = this.modalService.createLoadingModal();
                this.socketService.send<CreateTimeLimitedGameSessionDto, WaitingRoomStatus>(
                    GameSessionEvent.StartGameSession,
                    createGameSessionDto,
                    (waitingStatus) => {
                        loadingModal.close();
                        if (WaitingRoomStatus.Created === waitingStatus) this.showWaitingModal(waitingStatus);
                    },
                );
                break;
        }
    }

    private cancelGameSession() {
        this.socketService.send(GameSessionEvent.CancelGameSession);
        this.modal.closeAll();
    }

    private showWaitingModal(waitingStatus: WaitingRoomStatus) {
        const title = 'Attente...';
        let message = "En attente d'acceptation du créateur...";
        if (waitingStatus === WaitingRoomStatus.Created) {
            message = "En attente d'un autre joueur...";
        }
        this.modalService.createInformationModal(title, message, 'Annuler').then((result) => {
            if (result !== undefined) {
                this.cancelGameSession();
            }
        });
    }
}
