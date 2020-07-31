import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DontwantsRoutingModule } from './dontwants-routing.module';
import { SharedModule } from '../shared/shared.module';
import { DontwantsListComponent } from './dontwants-list/dontwants-list.component';
import { EditDontwantDialogComponent } from './edit-dontwant-dialog/edit-dontwant-dialog.component';


@NgModule({
  declarations: [
    DontwantsListComponent,
    EditDontwantDialogComponent,
  ],
  imports: [
    CommonModule,
    DontwantsRoutingModule,
    SharedModule,
  ]
})
export class DontwantsModule { }
