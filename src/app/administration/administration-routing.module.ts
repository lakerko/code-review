import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DashboardComponent } from './dashboard/dashboard.component';

const administrationRoutes: Routes = [
  {
    path: '',
    component: DashboardComponent,
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(administrationRoutes),
  ],
  exports: [
    RouterModule,
  ],
})
export class AdministrationRoutingModule {

}
