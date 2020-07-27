import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AnonymsListComponent } from './anonyms-list/anonyms-list.component';


const routes: Routes = [
  {
    path: '',
    component: AnonymsListComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AnonymsRoutingModule { }
