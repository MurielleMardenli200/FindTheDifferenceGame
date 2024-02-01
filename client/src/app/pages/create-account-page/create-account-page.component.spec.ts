import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CreateAccountPageComponent } from './create-account-page.component';

describe('CreateAccountPageComponent', () => {
    let component: CreateAccountPageComponent;
    let fixture: ComponentFixture<CreateAccountPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientModule, HttpClientTestingModule],
            declarations: [CreateAccountPageComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(CreateAccountPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should execute submittion logic when form is valid', () => {
        const registerAccountSpy = spyOn(component['accountService'], 'registerAccount');
        const userInfo = { username: 'username', email: 'test@gmail.com', password: 'Password1000', passwordConfirmation: 'Password1000' };
        component['createAccountForm'].setValue(userInfo);
        fixture.detectChanges();

        component.onSubmit();

        expect(registerAccountSpy).toHaveBeenCalled();
    });
});
