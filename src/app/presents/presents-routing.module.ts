import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PresentsListComponent } from './presents-list/presents-list.component';


const routes: Routes = [
  {
    path: '',
    component: PresentsListComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PresentsRoutingModule { }
