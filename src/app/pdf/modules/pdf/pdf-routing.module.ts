import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'pdf', pathMatch: 'full' },
  { path: 'pdf/:id', loadComponent: () => import('../../components/viewer/viewer.component').then(m => m.ViewerComponent) }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PdfRoutingModule { }
