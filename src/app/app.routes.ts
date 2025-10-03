import { Routes } from '@angular/router';
import { AuthGuard, LogedGuard } from './core/guard/auth.guard';

export const routes: Routes = [

    { path: '', redirectTo: 'auth', pathMatch: 'full' },
    {
        path: 'auth',
        loadChildren: () => import('./core/core.module').then(m => m.CoreModule),
        canActivate: [LogedGuard]
    },
    {
        path: 'realtime',
        loadChildren: () => import('./realtime/modules/realtimsetup/realtimsetup.module').then(m => m.RealtimsetupModule),
        canActivate: [AuthGuard],
    },
    { path: 'syncusers', loadComponent: () => import('./realtime/components/syncdata/syncdata.component').then(m => m.SyncdataComponent) },
    {
        path: 'viewer',
        loadChildren: () => import('./pdf/modules/pdf/pdf.module').then(m => m.PdfModule),
        canActivate: [AuthGuard],
        // data: { preload: true }
    },
    { path: 'dashboard', loadComponent: () => import('./core/components/dashboard/dashboard.component').then(m => m.DashboardComponent) },
];
