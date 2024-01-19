export enum GameSessionEvent {
    GameStart = 'gameStart',
    GuessDifference = 'guessDifference',
    RemainingDifferences = 'remainingDifferences',
    EndGame = 'endGame',
    DifferenceFound = 'differenceFound',
    GiveUp = 'giveUp',
    Message = 'message',
    GetGameState = 'getGameState',
    GameStateChanged = 'gameStateChanged',
    CancelGameSession = 'cancelGameSession',

    // New event
    StartGameSession = 'startGameSession',
    NewOpponent = 'newOpponent',
    AcceptOpponent = 'acceptOpponent',
    RejectOpponent = 'rejectOpponent',
    GameSessionCanceled = 'gameSessionCanceled',
    UseHint = 'hintUsed',
}
