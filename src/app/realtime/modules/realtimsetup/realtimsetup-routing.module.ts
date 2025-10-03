import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
const routes: Routes = [
  {
    path: '', redirectTo: 'dashboard', pathMatch: 'full'

  },
  {
    path: 'dashboard', loadComponent: () => import('../../components/dashbaord/dashbaord.component').then(m => m.DashbaordComponent)
  },
  // {
  //   path: 'livefeed/:id', loadComponent: () => import('../../components/livefeed/livefeed.component').then(m => m.LivefeedComponent)
  // },
  {
    path: 'livefeed/:id', loadComponent: () => import('../../components/realtime/realtime.component').then(m => m.RealtimeComponent)
  },
  { path: 'feed/:id', loadComponent: () => import('../../components/realtime/realtime.component').then(m => m.RealtimeComponent) }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RealtimsetupRoutingModule { }
