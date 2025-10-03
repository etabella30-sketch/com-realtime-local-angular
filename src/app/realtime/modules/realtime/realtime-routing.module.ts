import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'feed', pathMatch: 'full' },
  // { path: 'feed/:id', loadComponent: () => import('../../components/feed-display/feed-display.component').then(m => m.FeedDisplayComponent) }
  { path: 'feed/:id', loadComponent: () => import('../../components/realtime/realtime.component').then(m => m.RealtimeComponent) }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class realtimeRoutingModule { }