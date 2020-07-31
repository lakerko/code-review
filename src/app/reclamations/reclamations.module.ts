import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReclamationsRoutingModule } from './reclamations-routing.module';
import { ReclamationsListComponent } from './reclamations-list/reclamations-list.component';
import { EditReclamationDialogComponent } from './edit-reclamation-dialog/edit-reclamation-dialog.component';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  declarations: [ReclamationsListComponent, EditReclamationDialogComponent],
  imports: [
    CommonModule,
    ReclamationsRoutingModule,

    SharedModule,
  ]
})
export class ReclamationsModule { }
