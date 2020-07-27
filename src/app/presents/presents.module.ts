import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PresentsRoutingModule } from './presents-routing.module';
import { SharedModule } from '../shared/shared.module';
import { NgxDropzoneModule } from 'ngx-dropzone';

import { PresentsListComponent } from './presents-list/presents-list.component';
import { EdittechnicalStuffDialogComponent } from './edit-technicalStuff-dialog/edit-technicalStuff-dialog.component';
import { AddtechnicalStuffsDialogComponent } from './add-technicalStuffs-dialog/add-technicalStuffs-dialog.component';
import { PdfExtracterComponent } from './pdf/extract-pdf-dialog/pdf-extracter/pdf-extracter.component';
import { PdfTotechnicalStuffCreatorComponent } from './pdf/extract-pdf-dialog/pdf-to-technicalStuff-creator/pdf-to-technicalStuff-creator.component';
import { ExtractPdfDialogComponent } from './pdf/extract-pdf-dialog/extract-pdf-dialog.component';
import { CreateReclamationDialogComponent } from './create-reclamation-dialog/create-reclamation-dialog.component';

@NgModule({
  declarations: [
    PresentsListComponent,
    EdittechnicalStuffDialogComponent,
    AddtechnicalStuffsDialogComponent,
    PdfExtracterComponent,
    PdfTotechnicalStuffCreatorComponent,
    ExtractPdfDialogComponent,
    CreateReclamationDialogComponent,
  ],
  imports: [
    CommonModule,
    PresentsRoutingModule,
    SharedModule,

    NgxDropzoneModule,
  ]
})
export class PresentsModule { }
