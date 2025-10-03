import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./authantication/login/login.component').then(m => m.LoginComponent) },
  // { path: 'casecard', loadComponent: () => import('./../shared/components/casecard/casecard.component').then(m => m.CasecardComponent) }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CoreRoutingModule { }
