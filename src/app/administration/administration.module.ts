import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { AdministrationRoutingModule } from './administration-routing.module';

import { SharedModule } from '../shared/shared.module';

import { DashboardComponent } from './dashboard/dashboard.component';
import { StoresManagementComponent } from './stores/stores-management/stores-management.component';
import { EmployeesManagementComponent } from './employees/employees-management/employees-management.component';
import { EmployeeDetailComponent } from './employees/employee-detail/employee-detail.component';
import { CreateUserDialogComponent } from './create-user-dialog/create-user-dialog.component';
import { otherTechnicalStuffsListComponent } from './otherTechnicalStuffs-list/otherTechnicalStuffs-list.component';
import { EditotherTechnicalStuffDialogComponent } from './otherTechnicalStuffs-list/edit-otherTechnicalStuff-dialog/edit-otherTechnicalStuff-dialog.component';
import { ConfirmotherTechnicalStuffDialogComponent } from './otherTechnicalStuffs-list/confirm-otherTechnicalStuff-dialog/confirm-otherTechnicalStuff-dialog.component';

@NgModule({
  declarations: [
    DashboardComponent,
    StoresManagementComponent,
    EmployeesManagementComponent,
    EmployeeDetailComponent,
    CreateUserDialogComponent,
    otherTechnicalStuffsListComponent,
    EditotherTechnicalStuffDialogComponent,
    ConfirmotherTechnicalStuffDialogComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AdministrationRoutingModule,

    SharedModule,
  ]
})
export class AdministrationModule { }
