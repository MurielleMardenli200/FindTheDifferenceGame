import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClassicModeComponent } from '@app/pages/classic-mode/classic-mode.component';
import { ConfigurationComponent } from '@app/pages/configuration/configuration.component';
import { CreateGamePageComponent } from '@app/pages/create-game-page/create-game-page.component';
import { LoginPageComponent } from '@app/pages/login-page/login-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { SelectionPageComponent } from '@app/pages/selection-page/selection-page.component';
import { TimeLimitedSelectionPageComponent } from '@app/pages/time-limited-selection-page/time-limited-selection-page.component';
import { TimeLimitedModeComponent } from '@app/pages/time-limited/time-limited-mode.component';
import { authGuard } from '@app/services/auth-guard/auth.guard';

const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'home', component: MainPageComponent, canActivate: [authGuard] },
    { path: 'config', component: ConfigurationComponent, canActivate: [authGuard] },
    { path: 'classic', component: ClassicModeComponent, canActivate: [authGuard] },
    { path: 'create-game', component: CreateGamePageComponent, canActivate: [authGuard] },
    { path: 'selection', component: SelectionPageComponent, canActivate: [authGuard] },
    { path: 'time-limited', component: TimeLimitedModeComponent, canActivate: [authGuard] },
    { path: 'time-limited-selection', component: TimeLimitedSelectionPageComponent, canActivate: [authGuard] },
    { path: 'login', component: LoginPageComponent },
    { path: '**', redirectTo: '/login' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
