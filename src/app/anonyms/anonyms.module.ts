import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AnonymsRoutingModule } from './anonyms-routing.module';
import { SharedModule } from '../shared/shared.module';

import { AnonymsListComponent } from './anonyms-list/anonyms-list.component';
import { EditAnonymDialogComponent } from './edit-anonym-dialog/edit-anonym-dialog.component';


@NgModule({
  declarations: [
    AnonymsListComponent,
    EditAnonymDialogComponent,
  ],
  imports: [
    CommonModule,
    AnonymsRoutingModule,
    SharedModule,
  ]
})
export class AnonymsModule { }
