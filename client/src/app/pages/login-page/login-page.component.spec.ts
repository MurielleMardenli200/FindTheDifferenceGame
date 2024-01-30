import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { LoginPageComponent } from './login-page.component';
import { SocialAuthService } from '@abacritt/angularx-social-login';
import { AccountService } from '@app/services/account/account.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { TEAM_MEMBERS } from '@app/constants/initial-view-constants';

describe('LoginPageComponent', () => {
    let component: LoginPageComponent;
    let fixture: ComponentFixture<LoginPageComponent>;
    let socialAuthServiceSpy: jasmine.SpyObj<SocialAuthService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let accountServiceSpy: jasmine.SpyObj<AccountService>;

    beforeEach(async () => {
        socialAuthServiceSpy = jasmine.createSpyObj('SocialAuthService', ['authState'], { authState: of() });
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        accountServiceSpy = jasmine.createSpyObj('AccountService', ['logInAccount']);

        await TestBed.configureTestingModule({
            declarations: [LoginPageComponent],
            imports: [ReactiveFormsModule, RouterTestingModule, ReactiveFormsModule],
            providers: [
                { provide: SocialAuthService, useValue: socialAuthServiceSpy },
                { provide: Router, useValue: routerSpy },
                FormBuilder,
                { provide: AccountService, useValue: accountServiceSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(LoginPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should log in account and navigate to home page on form submission', () => {
        const userInfo = { username: 'username', password: 'password' };
        accountServiceSpy.logInAccount.and.returnValue(of({}));
        component.logInForm.setValue(userInfo);
        component.onSubmit();
        expect(accountServiceSpy.logInAccount).toHaveBeenCalledWith(userInfo);
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
        expect(component.logInForm.value).toEqual({ username: null, password: null });
    });

    it('should return team members', () => {
        const teamMembers = component.getTeamMembers();
        expect(teamMembers).toEqual(TEAM_MEMBERS);
    });
});
