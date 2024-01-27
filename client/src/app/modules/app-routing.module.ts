import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClassicModeComponent } from '@app/pages/classic-mode/classic-mode.component';
import { ConfigurationComponent } from '@app/pages/configuration/configuration.component';
import { CreateGamePageComponent } from '@app/pages/create-game-page/create-game-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { SelectionPageComponent } from '@app/pages/selection-page/selection-page.component';
import { TimeLimitedSelectionPageComponent } from '@app/pages/time-limited-selection-page/time-limited-selection-page.component';
import { TimeLimitedModeComponent } from '@app/pages/time-limited/time-limited-mode.component';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: MainPageComponent },
    { path: 'config', component: ConfigurationComponent },
    { path: 'classic', component: ClassicModeComponent },
    { path: 'create-game', component: CreateGamePageComponent },
    { path: 'selection', component: SelectionPageComponent },
    { path: 'time-limited', component: TimeLimitedModeComponent },
    { path: 'time-limited-selection', component: TimeLimitedSelectionPageComponent },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
