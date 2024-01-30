import { TimedHistoryEntry } from '@app/decorators/history/history';
import { ClassicModeService } from '@app/services/classic-mode/classic-mode.service';
import { Subject } from 'rxjs';

export class Replay {
    private classicModeService: ClassicModeService;
    private initialHistory: TimedHistoryEntry<ClassicModeService>[];
    private history: TimedHistoryEntry<ClassicModeService>[];
    private timeout?: ReturnType<typeof setTimeout>;
    private finishedSubject: Subject<void> = new Subject<void>();
    private beginTime: number;
    private lastEntryTime: number = 0;
    private speedChangedSubject: Subject<number>;

    private _speed = 1;

    constructor(
        classicModeService: ClassicModeService,
        history: TimedHistoryEntry<ClassicModeService>[],
        replaySpeedChangedSubject: Subject<number>,
    ) {
        this.classicModeService = classicModeService;
        this.initialHistory = [...history];
        this.history = [...history];
        this.speedChangedSubject = replaySpeedChangedSubject;

        this.beginTime = Date.now();
        this.scheduleNextEntry();
    }

    get finishedObservable() {
        return this.finishedSubject.asObservable();
    }

    get speed() {
        return this._speed;
    }

    set speed(speed: number) {
        this._speed = speed;
        this.pause();
        this.resume();
    }

    pause() {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.lastEntryTime = this.getRelativeTime();
            this.timeout = undefined;
            this.speedChangedSubject.next(0);
        }
    }

    resume() {
        if (!this.timeout) {
            this.adjustBeginTime();
            this.scheduleNextEntry();
            this.speedChangedSubject.next(this._speed);
        }
    }

    isPaused() {
        return this.timeout === undefined;
    }

    restart() {
        this.pause();
        this.beginTime = Date.now();
        this.lastEntryTime = 0;
        this.history = [...this.initialHistory];
        this.scheduleNextEntry();
    }

    end() {
        this.history = [];
        this.finishedSubject.next();
    }

    private getRelativeTime() {
        return Date.now() - this.beginTime;
    }

    private adjustBeginTime() {
        this.beginTime = Date.now() - this.lastEntryTime;
    }

    private scheduleNextEntry() {
        const entry = this.history.at(0);
        if (!entry) {
            this.finishedSubject.next();
            return;
        }

        this.timeout = setTimeout(() => {
            this.history.shift();
            entry.action(this.classicModeService);
            this.lastEntryTime = entry.time;
            this.scheduleNextEntry();
        }, (entry.time - this.lastEntryTime) / this._speed);
    }
}
