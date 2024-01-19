import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ButtonState } from '@app/enums/button-state';
import { GameSelectionService } from '@app/services/game-selection/game-selection.service';
import { ButtonStubComponent } from '@app/stubs/button.component.stub';
import { UserNameComponent } from './user-name.component';
import SpyObj = jasmine.SpyObj;

describe('UserNameComponent', () => {
    let component: UserNameComponent;
    let fixture: ComponentFixture<UserNameComponent>;
    let gameSelectionServiceSpy: SpyObj<GameSelectionService>;
    let modalRefSpy: SpyObj<MatDialogRef<UserNameComponent>>;
    let modalSpy: SpyObj<MatDialog>;
    const mockSubmitEvent = { preventDefault: () => undefined };
    const fakeMatDialogData = {
        state: ButtonState.Create,
    };

    beforeEach(async () => {
        gameSelectionServiceSpy = jasmine.createSpyObj(GameSelectionService, ['setupNewGame']);
        modalRefSpy = jasmine.createSpyObj(MatDialogRef<UserNameComponent>, ['close']);
        modalSpy = jasmine.createSpyObj(MatDialog, ['open']);

        await TestBed.configureTestingModule({
            declarations: [UserNameComponent, ButtonStubComponent],
            providers: [
                { provide: GameSelectionService, useValue: gameSelectionServiceSpy },
                { provide: MatDialogRef<UserNameComponent>, useValue: modalRefSpy },
                { provide: MatDialog, useValue: modalSpy },
                { provide: MAT_DIALOG_DATA, useValue: fakeMatDialogData },
            ],
            imports: [ReactiveFormsModule],
        }).compileComponents();

        fixture = TestBed.createComponent(UserNameComponent);
        component = fixture.componentInstance;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('playGame should do nothing if no username is entered', () => {
        component.playGame(mockSubmitEvent as Event);
        expect(modalRefSpy.close).not.toHaveBeenCalled();
    });

    it('playGame should close the modal and return the username', () => {
        component.username = 'TestMan';
        component.playGame(mockSubmitEvent as Event);
        expect(modalRefSpy.close).toHaveBeenCalledWith(component.username);
    });
});
