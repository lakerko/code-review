import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DontwantsListComponent } from './dontwants-list/dontwants-list.component';


const routes: Routes = [
  {
    path: '',
    component: DontwantsListComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DontwantsRoutingModule { }
