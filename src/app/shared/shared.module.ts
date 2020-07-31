import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { PortalModule } from '@angular/cdk/portal';

import { FlexLayoutModule, LayoutGapStyleBuilder } from '@angular/flex-layout';
import { CustomLayoutGapStyleBuilder } from './custom-layout-gap-style-builder';

import { ClipboardModule } from 'ngx-clipboard';
// import { NgxBarcodeModule, NgxBarcodeComponent } from 'ngx-barcode';

import { LoginComponent } from './login/login.component';
import { WarehouseStateIndicatorComponent } from './warehouse-state-indicator/warehouse-state-indicator.component';
import { ShellComponent } from './shell/shell.component';

import { SelecttechnicalStuffFormGroupComponent } from './select-technicalStuff-form-group/select-technicalStuff-form-group.component';
import { InputtechnicalStuffFormGroupComponent } from './input-technicalStuff-form-group/input-technicalStuff-form-group.component';

import { LoadingOverlayComponent } from './loading-overlay/loading-overlay.component';

import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { MassEditDialogComponent } from './mass-edit-dialog/mass-edit-dialog.component';

import { KeysPipe } from './keys.pipe';
import { FirestoreDatePipe } from './firestore-date.pipe';
import { PrinterDirective } from './printer/printer.directive';
import { DisableGlobalDirective } from './disable-global.directive';
import { CountCharsPipe } from './count-chars.pipe';
import { FilterComponent } from './filter/filter.component';
import { PopoverComponent } from './popover/popover.component';
import { PasswordAccessDialogComponent } from './shell/password-access-dialog/password-access-dialog.component';
// import { TableComponent } from './table/table.component';

@NgModule({
  declarations: [
    LoginComponent,
    WarehouseStateIndicatorComponent,
    ShellComponent,

    SelecttechnicalStuffFormGroupComponent,
    InputtechnicalStuffFormGroupComponent,
    FilterComponent,
    // TableComponent,

    LoadingOverlayComponent,

    ConfirmDialogComponent,
    MassEditDialogComponent,
    PopoverComponent,

    KeysPipe,
    FirestoreDatePipe,

    PrinterDirective,
    DisableGlobalDirective,
    CountCharsPipe,
    PasswordAccessDialogComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,

    MatToolbarModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatTableModule,
    MatSortModule,
    MatDialogModule,
    MatSnackBarModule,
    MatMenuModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatSidenavModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatTabsModule,
    PortalModule,
    FlexLayoutModule,

    ClipboardModule,
    // NgxBarcodeModule,
  ],
  exports: [
    RouterModule,
    ReactiveFormsModule,

    MatToolbarModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatTableModule,
    MatSortModule,
    MatDialogModule,
    MatSnackBarModule,
    MatMenuModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatSidenavModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatTabsModule,
    PortalModule,
    FlexLayoutModule,

    ShellComponent,

    LoadingOverlayComponent,

    WarehouseStateIndicatorComponent,

    SelecttechnicalStuffFormGroupComponent,
    InputtechnicalStuffFormGroupComponent,
    FilterComponent,
    // TableComponent,

    KeysPipe,
    FirestoreDatePipe,
    CountCharsPipe,
    // NgxBarcodeComponent,
  ],
  providers: [
    { provide: LayoutGapStyleBuilder, useClass: CustomLayoutGapStyleBuilder },
  ]
})
export class SharedModule { }
