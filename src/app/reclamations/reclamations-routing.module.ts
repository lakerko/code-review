import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReclamationsListComponent } from './reclamations-list/reclamations-list.component';


const routes: Routes = [
  {
    path: '',
    component: ReclamationsListComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReclamationsRoutingModule { }
