import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameStartService } from '@app/services/game-start/game-start.service';

import { AnimatedBackgroundStubComponent } from '@app/stubs/animated-background.component.stub';
import { ButtonStubComponent } from '@app/stubs/button.component.stub';
import { PageBaseStubComponent } from '@app/stubs/page-base.component.stub';
import { TimeLimitedSelectionPageComponent } from './time-limited-selection-page.component';
import SpyObj = jasmine.SpyObj;

describe('TimeLimitedSelectionPageComponent', () => {
    let component: TimeLimitedSelectionPageComponent;
    let fixture: ComponentFixture<TimeLimitedSelectionPageComponent>;
    let gameStartServiceSpy: SpyObj<GameStartService>;

    beforeEach(async () => {
        gameStartServiceSpy = jasmine.createSpyObj('GameStartService', ['']);
        await TestBed.configureTestingModule({
            declarations: [TimeLimitedSelectionPageComponent, ButtonStubComponent, AnimatedBackgroundStubComponent, PageBaseStubComponent],
            providers: [{ provide: GameStartService, useValue: gameStartServiceSpy }],
        }).compileComponents();

        fixture = TestBed.createComponent(TimeLimitedSelectionPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
