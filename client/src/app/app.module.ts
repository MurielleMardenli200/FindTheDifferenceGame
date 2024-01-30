import { GoogleLoginProvider, GoogleSigninButtonModule, SocialAuthServiceConfig, SocialLoginModule } from '@abacritt/angularx-social-login';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DifferencesPreviewModalComponent } from '@app/components/differences-preview-modal/differences-preview-modal.component';
import { GameSheetComponent } from '@app/components/game-sheet/game-sheet.component';
import { ImageAreaComponent } from '@app/components/image-area/image-area.component';
import { LoadImageButtonComponent } from '@app/components/load-image-button/load-image-button.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppComponent } from '@app/pages/app/app.component';
import { ConfigurationComponent } from '@app/pages/configuration/configuration.component';
import { CreateGamePageComponent } from '@app/pages/create-game-page/create-game-page.component';
import { environment } from 'src/environments/environment';
import { ActionModalComponent } from './components/action-modal/action-modal.component';
import { AnimatedBackgroundComponent } from './components/animated-background/animated-background.component';
import { ButtonComponent } from './components/button/button.component';
import { CanvasComponent } from './components/canvas/canvas.component';
import { ConfirmModalComponent } from './components/confirm-modal/confirm-modal.component';
import { ErrorModalComponent } from './components/error-modal/error-modal.component';
import { GameConstantsModalComponent } from './components/game-constants-modal/game-constants-modal.component';
import { GameSelectionPanelComponent } from './components/game-selection-panel/game-selection-panel.component';
import { HistoryModalComponent } from './components/history-modal/history-modal.component';
import { ImageAreaGameComponent } from './components/image-area-game/image-area-game.component';
import { LeaderboardComponent } from './components/leaderboard/leaderboard.component';
import { LoadingModalComponent } from './components/loading-modal/loading-modal.component';
import { MessageBarComponent } from './components/message-bar/message-bar.component';
import { MessageComponent } from './components/message/message.component';
import { PaintToolsComponent } from './components/paint-tools/paint-tools.component';
import { TimerComponent } from './components/timer/timer.component';
import { UserNameComponent } from './components/user-name/user-name.component';
import { ClassicModeComponent } from './pages/classic-mode/classic-mode.component';
import { CreateAccountPageComponent } from './pages/create-account-page/create-account-page.component';
import { GamePageComponent } from './pages/game-page/game-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { PageBaseComponent } from './pages/page-base-component/page-base-component.component';
import { SelectionPageComponent } from './pages/selection-page/selection-page.component';
import { TimeLimitedSelectionPageComponent } from './pages/time-limited-selection-page/time-limited-selection-page.component';
import { TimeLimitedModeComponent } from './pages/time-limited/time-limited-mode.component';
import { InterceptorService } from './services/interceptor/interceptor.service';
/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
@NgModule({
    declarations: [
        ActionModalComponent,
        AppComponent,
        SidebarComponent,
        ButtonComponent,
        CreateGamePageComponent,
        ImageAreaComponent,
        LoadImageButtonComponent,
        DifferencesPreviewModalComponent,
        SelectionPageComponent,
        SelectionPageComponent,
        ConfigurationComponent,
        GameSheetComponent,
        LeaderboardComponent,
        ButtonComponent,
        GameSelectionPanelComponent,
        ErrorModalComponent,
        ClassicModeComponent,
        ImageAreaGameComponent,
        UserNameComponent,
        MainPageComponent,
        PageBaseComponent,
        CanvasComponent,
        MessageComponent,
        MessageBarComponent,
        LoadingModalComponent,
        ConfirmModalComponent,
        AnimatedBackgroundComponent,
        PaintToolsComponent,
        ActionModalComponent,
        TimeLimitedModeComponent,
        GamePageComponent,
        TimeLimitedSelectionPageComponent,
        GameConstantsModalComponent,
        TimerComponent,
        HistoryModalComponent,
        LoginPageComponent,
        CreateAccountPageComponent,
    ],
    imports: [
        AppMaterialModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        HttpClientModule,
        MatFormFieldModule,
        MatInputModule,
        MatTableModule,
        ReactiveFormsModule,
        SocialLoginModule,
        GoogleSigninButtonModule,
    ],
    providers: [
        {
            provide: 'SocialAuthServiceConfig',
            useValue: {
                autoLogin: false,
                providers: [
                    {
                        id: GoogleLoginProvider.PROVIDER_ID,
                        provider: new GoogleLoginProvider(environment.googleClientId),
                    },
                ],
                onError: (err) => {
                    // eslint-disable-next-line no-console
                    console.error(err);
                },
            } as SocialAuthServiceConfig,
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: InterceptorService,
            multi: true,
        },
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
