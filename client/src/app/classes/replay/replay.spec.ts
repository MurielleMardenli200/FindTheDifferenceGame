/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { ClassicModeService } from '@app/services/classic-mode/classic-mode.service';
import { Subject } from 'rxjs';
import { Replay } from './replay';

describe('Replay', () => {
    let replay: Replay;
    const classicModeService = {} as ClassicModeService;
    let setTimeoutSpy: jasmine.Spy<typeof setTimeout>;
    let fakeSubject: jasmine.SpyObj<Subject<number>>;

    beforeEach(() => {
        setTimeoutSpy = spyOn(window, 'setTimeout');
        fakeSubject = jasmine.createSpyObj('Subject', ['next']);
        replay = new Replay(classicModeService, [], fakeSubject);
    });

    it('should be created', () => {
        expect(replay).toBeTruthy();
    });

    it('get finishedObservable() should return finishedSubject', () => {
        expect(replay.finishedObservable).toEqual(replay['finishedSubject'].asObservable());
    });

    it('get speed() should return _speed', () => {
        expect(replay.speed).toBe(replay['_speed']);
    });

    it('set speed() should set _speed', () => {
        replay.speed = 2;
        expect(replay['_speed']).toBe(2);
    });

    it('pause() should clear timeout', () => {
        const getRelativeTimeSpy = spyOn<any>(replay, 'getRelativeTime').and.returnValue(50);
        const clearTimeoutSpy = spyOn(window, 'clearTimeout');
        replay['timeout'] = 1234 as any;
        replay['pause']();
        expect(clearTimeoutSpy).toHaveBeenCalledWith(1234);
        expect(replay['lastEntryTime']).toBe(50);
        expect(replay['timeout']).toBeUndefined();
        expect(getRelativeTimeSpy).toHaveBeenCalled();
    });

    it('resume() should adjusr begin time and schedule next entry', () => {
        const adjustBeginTimeSpy = spyOn<any>(replay, 'adjustBeginTime');
        const scheduleNextEntrySpy = spyOn<any>(replay, 'scheduleNextEntry');
        replay['timeout'] = undefined;
        replay['resume']();
        expect(adjustBeginTimeSpy).toHaveBeenCalled();
        expect(scheduleNextEntrySpy).toHaveBeenCalled();
    });

    it('isPaused() should return true if timeout is undefined', () => {
        replay['timeout'] = undefined;
        expect(replay['isPaused']()).toBeTrue();
    });

    it('restart() should pause and set begin time and last entry time', () => {
        const pauseSpy = spyOn<any>(replay, 'pause');
        spyOn(Date, 'now').and.returnValue(5678);
        replay['beginTime'] = 1234;
        replay['lastEntryTime'] = 5678;
        replay['history'] = [1, 2, 3] as any;
        replay['initialHistory'] = [4, 5, 6] as any;
        replay['restart']();
        expect(pauseSpy).toHaveBeenCalled();
        expect(replay['beginTime']).toBe(5678);
        expect(replay['lastEntryTime']).toBe(0);
        expect(replay['history']).toEqual([4, 5, 6] as any);
    });

    it('getRelativeTime() should return time since begin time', () => {
        spyOn(Date, 'now').and.returnValue(5678);
        replay['beginTime'] = 1234;
        expect(replay['getRelativeTime']()).toBe(5678 - 1234);
    });

    it('adjustBeginTime() should set begin time', () => {
        spyOn(Date, 'now').and.returnValue(5678);
        replay['lastEntryTime'] = 1234;
        replay['adjustBeginTime']();
        expect(replay['beginTime']).toBe(5678 - 1234);
    });

    it('scheduleNextEntry() should set timeout', () => {
        setTimeoutSpy.and.callFake(((callback: () => void) => {
            callback();
        }) as any);
        replay['history'] = [
            {
                time: 1234,
                action: (service: any) => {
                    expect(service).toBe(classicModeService);
                },
            },
        ] as any;
        replay['speed'] = 2;
        replay['scheduleNextEntry']();
        expect(setTimeoutSpy).toHaveBeenCalledWith(jasmine.any(Function), 1234 / 2);
    });

    it('scheduleNextEntry() should finish if history is empty', () => {
        const finishSpy = spyOn(replay['finishedSubject'], 'next');
        replay['history'] = [] as any;
        replay['scheduleNextEntry']();
        expect(finishSpy).toHaveBeenCalled();
    });
});
