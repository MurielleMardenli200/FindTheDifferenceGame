import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { ButtonStubComponent } from '@app/stubs/button.component.stub';
import { ErrorModalComponent } from './error-modal.component';
import SpyObj = jasmine.SpyObj;
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ErrorModalComponent', () => {
    let component: ErrorModalComponent;
    let fixture: ComponentFixture<ErrorModalComponent>;
    let modalRefSpy: SpyObj<MatDialogRef<ErrorModalComponent>>;

    beforeEach(async () => {
        modalRefSpy = jasmine.createSpyObj('MatDialogRef<ErrorModalComponent>', ['open', 'close']);
        await TestBed.configureTestingModule({
            declarations: [ErrorModalComponent, ButtonStubComponent],
            providers: [{ provide: MatDialogRef<ErrorModalComponent>, useValue: modalRefSpy }],
            imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([{ path: 'home', component: MainPageComponent }])],
        }).compileComponents();

        fixture = TestBed.createComponent(ErrorModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('close should close the modal', () => {
        component.close();
        expect(modalRefSpy.close).toHaveBeenCalled();
    });
});
