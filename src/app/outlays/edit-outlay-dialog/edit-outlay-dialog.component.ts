import {
  Component,
  OnInit,
  Inject,
  OnDestroy,
  ViewChildren,
  QueryList,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AngularFireAnalytics } from '@angular/fire/analytics';

import { Subscription } from 'rxjs';

import { DataService } from '../../shared/data/data.service';
import { DateService } from '../../shared/services/date.service';
import { UserService } from 'src/app/shared/services/user.service';
import { HelperService } from '../../shared/services/helper.service';
import { DialogService } from '../../shared/services/dialog.service';
import { DictionaryService } from '../../shared/services/dictionary.service';
import { EmployeeInfo, User } from 'src/app/shared/shared.model';
import { Dontwant } from '../dontwant.model';
import { DontwantsService } from '../dontwants.service';

import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { InputtechnicalStuffFormGroupComponent } from 'src/app/shared/input-technicalStuff-form-group/input-technicalStuff-form-group.component';

@Component({
  selector: 'app-edit-dontwant-dialog',
  templateUrl: './edit-dontwant-dialog.component.html',
  styleUrls: ['./edit-dontwant-dialog.component.scss']
})
export class EditDontwantDialogComponent implements OnInit, OnDestroy {
  @ViewChildren(InputtechnicalStuffFormGroupComponent) inputtechnicalStuffGroups: QueryList<InputtechnicalStuffFormGroupComponent>;
  private propertiesToCompare = [
    'technicalStuff', 'note', 'hsDispatchDate', 'hsDispatchDateTechnician', 'type', 'otherTechnicalStuff', 'assignedTo', 'customerName', 'customerPhone',
  ];
  private editDontwantFormChanges$: Subscription;
  private technicians$: Subscription;
  public displayTechnicians: EmployeeInfo[] = [];
  public user: User;
  public editDontwantForm: FormGroup;

  public isEditMode: boolean = this.data.mode === 'edit';

  private dontwantData: Dontwant;

  public isDispatched: boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<EditDontwantDialogComponent>,
    private fb: FormBuilder,
    private analytics: AngularFireAnalytics,
    private dateService: DateService,
    private dataService: DataService,
    private dontwantsService: DontwantsService,
    private userService: UserService,
    private helper: HelperService,
    private dialogService: DialogService,
    public dictionary: DictionaryService,
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {
    this.dontwantData = this.data.dontwantData;
    this.isDispatched = this.dontwantData.dispatched;
    this.user = this.userService.getUser();
    console.warn('data', this.data);

    this.editDontwantForm = this.fb.group({
      technicalStuff: [
        {
          technicalStuff: this.dontwantData.technicalStuff || null,
          type: this.dontwantData.type || null,
          otherTechnicalStuff: this.dontwantData.otherTechnicalStuff || null,
        },
        [ Validators.required ],
      ],
      hsDispatchDate: [
        {
          value: this.dontwantData.hsDispatchDate
            ? this.dateService.getValidDateStringFormatFromDate(this.dontwantData.hsDispatchDate)
            : null,
          disabled: this.user.isTechnician,
        },
        [ this.dateService.validateDate(this.dateService) ]
      ],
      hsDispatchDateTechnician: [
        this.dontwantData.hsDispatchDateTechnician
          ? this.dateService.getValidDateStringFormatFromDate(this.dontwantData.hsDispatchDateTechnician)
          : null,
        [ this.dateService.validateDate(this.dateService) ],
      ],
      createdAt: [
        this.dontwantData.createdAt
          ? this.dateService.getValidDateStringFormatFromDate(this.dontwantData.createdAt)
          : this.dateService.getCurrentDateAsString(),
        [ this.dateService.validateDate(this.dateService) ],
      ],
      assignedTo: [
        this.dontwantData.assignedTo ? this.dontwantData.assignedTo.uid : null,
      ],
      customerName: [
        this.dontwantData.customerName,
        [ Validators.required ],
      ],
      customerPhone: [
        this.dontwantData.customerPhone,
        [ Validators.required, Validators.pattern('^[9]{1}[0-9]{2}[ ]{0,1}[0-9]{3}[ ]{0,1}[0-9]{3}$')],
      ],
      note: [ this.dontwantData.note || null ],
    });

    this.manageDispatchEligibility();

    if (this.dontwantData.hsDispatchDate) {
      this.editDontwantForm.disable();
    }

    this.editDontwantFormChanges$ = this.editDontwantForm.valueChanges.subscribe((value: string) => {
      this.manageDispatchEligibility();
    });

    this.getTechnicians();
  }

  get technicalStuff() { return this.editDontwantForm.get('technicalStuff'); }
  get type() { return this.editDontwantForm.get('type'); }
  get customerName() { return this.editDontwantForm.get('customerName'); }
  get customerPhone() { return this.editDontwantForm.get('customerPhone'); }
  get hsDispatchDate() { return this.editDontwantForm.get('hsDispatchDate'); }
  get hsDispatchDateTechnician() { return this.editDontwantForm.get('hsDispatchDateTechnician'); }

  getFormValidationErrors() {
    this.editDontwantForm.markAllAsTouched();
    this.inputtechnicalStuffGroups.forEach(comp => {
      comp.technicalStuffForm.markAllAsTouched();
    });
  }

  getTechnicians() {
    this.technicians$ = this.dataService.getTechnicians().subscribe((technicians: EmployeeInfo[]) => {
      this.displayTechnicians = this.helper.getTechniciansWithEmptyOption(technicians);
      this.displayTechnicians = this.helper.getTechniciansWithUnofficial(this.dontwantData.assignedTo, this.displayTechnicians);
    });
  }

  manageDispatchEligibility() {
    if (this.user.isTechnician) {
      this.hsDispatchDate.disable({ emitEvent: false });
      return;
    }

    const isDispatchDisabled = !this.editDontwantForm || (
      this.technicalStuff.invalid ||
      this.customerName.invalid ||
      this.customerPhone.invalid
    );

    if (isDispatchDisabled) {
      this.hsDispatchDate.disable({ emitEvent: false });
    } else {
      this.hsDispatchDate.enable({ emitEvent: false });
    }
  }

  onSaveDontwant() {
    if (this.editDontwantForm.invalid) {
      this.getFormValidationErrors();
      return;
    }

    const rawData = this.editDontwantForm.getRawValue();
    if (!this.dontwantData.createdBy) {
      rawData.createdBy = this.helper.getEmployeeInfo(this.user);
    }
    if (this.user.isTechnician && !this.dontwantData.assignedTo) {
      rawData.assignedTo = this.helper.getEmployeeInfo(this.user);
    } else if (!this.user.isTechnician && !this.dontwantData.assignedTo) {
      const assignedTechnician = this.displayTechnicians.find((technician) => technician.uid === rawData.assignedTo);
      rawData.assignedTo = this.helper.getEmployeeInfo(assignedTechnician);
    }

    const transformedForm = this.transformFormDataToRequestData(rawData);
    const originWithDates = this.transfromtDatesToDateObjects(this.getParsableData(this.dontwantData));

    const changesObj = this.helper.getChangesObject(
      originWithDates, transformedForm, this.propertiesToCompare
    );
    const changes = this.helper.getKeyValuePairsFromChanges(changesObj);

    if (this.dontwantData.dispatched === null || this.dontwantData.dispatched === undefined) {
      changes.dispatched = false;
    }
    if (
      changesObj &&
      changesObj.hsDispatchDate &&
      changesObj.hsDispatchDate.newValue &&
      !changesObj.hsDispatchDate.oldValue
    ) {
      changes.dispatched = true;
    }

    if (this.dontwantData.dispatchedByTechnician === null || this.dontwantData.dispatchedByTechnician === undefined) {
      changes.dispatchedByTechnician = false;
    }
    if (
      changesObj &&
      changesObj.hsDispatchDateTechnician &&
      changesObj.hsDispatchDateTechnician.newValue &&
      !changesObj.hsDispatchDateTechnician.oldValue
    ) {
      changes.dispatchedByTechnician = true;
    }

    if (changesObj && !changesObj.assignedTo && this.dontwantData.assignedTo) {
      changesObj.assignedAt = null;
    } else if (
      changesObj && changesObj.assignedTo &&
      ((!this.dontwantData.assignedTo) ||
      (this.dontwantData.assignedTo !== changesObj.assignedTo.newValue))
    ) {
      changes.assignedAt = this.dateService.getCurrentDateAsDate();
    }

    if (changesObj && changesObj.hsDispatchDate && !changesObj.hsDispatchDate.newValue) {
      changes.hsDispatchDate = null;
    }

    if (
      changesObj &&
      changesObj.hsDispatchDateTechnician &&
      !changesObj.hsDispatchDateTechnician.newValue
    ) {
      changes.hsDispatchDateTechnician = null;
    }

    if (this.data.mode === 'edit') {
      this.editDontwant(changes);
    } else {
      this.createDontwant(changes);
    }
    this.dialogRef.close(changes);
  }

  transformFormDataToRequestData(data) {
    const transformed: any = {};

    if (data.technicalStuff && data.technicalStuff.technicalStuff) {
      transformed.technicalStuff = data.technicalStuff.technicalStuff;
      transformed.type = data.technicalStuff.type;
      transformed.otherTechnicalStuff = data.technicalStuff.otherTechnicalStuff;
    }

    if (data.hsDispatchDate) {
      transformed.hsDispatchDate = this.dateService.getValidDateObjectFromString(data.hsDispatchDate);
    }

    if (data.hsDispatchDateTechnician) {
      transformed.hsDispatchDateTechnician = this.dateService.getValidDateObjectFromString(data.hsDispatchDateTechnician);
    }

    if (data.assignedTo && typeof data.assignedTo === 'string') {
      const assignedTechnician = this.displayTechnicians.find((technician) => technician.uid === data.assignedTo);
      transformed.assignedTo = this.helper.getEmployeeInfo(assignedTechnician);
    } else if (data.assignedTo && data.assignedTo.uid) {
      const assignedTechnician = this.displayTechnicians.find((technician) => technician.uid === data.assignedTo.uid);
      transformed.assignedTo = this.helper.getEmployeeInfo(assignedTechnician);
    }

    transformed.customerName = data.customerName;
    transformed.customerPhone = data.customerPhone;
    transformed.note = data.note;
    console.warn('transformed', transformed);

    return transformed;
  }

  transfromtDatesToDateObjects(data) {
    console.warn('data', data);
    const result = JSON.parse(JSON.stringify(data));
    if (result.hsDispatchDate) {
      result.hsDispatchDate = this.dateService.getValidDateObjectFromString(
        this.dateService.getValidDateStringFormatFromDate(result.hsDispatchDate)
      );
    }

    return result;
  }

  getParsableData(data) {
    const result = {};
    for (const key of Object.keys(data)) {
      if (key !== 'technicalStuffRef' && key !== 'relationships') {
        result[key] = data[key];
      }
    }

    return result;
  }

  createDontwant(dontwantPayload) {
    this.dontwantsService.createDontwant(dontwantPayload);
    this.analytics.logEvent('create_dontwant');
  }

  editDontwant(dontwantPayload): void {
    this.dontwantsService.editDontwant(dontwantPayload, this.dontwantData.id);
    this.analytics.logEvent('edit_dontwant', { id: this.dontwantData.id });
  }

  allowEditing() {
    const dialogRef = this.dialogService.createDialogRef({
      component: ConfirmDialogComponent,
      width: '300px',
      data: {
        textContent: `Naozaj si prajete editovať ukončené Dontwantie?`,
        title: 'Povoliť editáciu',
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.editDontwantForm.enable();
      }
    });
  }

  returnToOpened() {
    const dialogRef = this.dialogService.createDialogRef({
      component: ConfirmDialogComponent,
      width: '300px',
      data: {
        textContent: `Naozaj si prajete vrátiť ukončené Dontwantie do neukončených?
        Zmaže sa dátum odoslania.`,
        title: 'Vrátiť ukončené Dontwantie do neukončených',
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dontwantsService.editDontwant({
          hsDispatchDate: null,
          dispatched: false,
        }, this.dontwantData.id);
        this.onNoClick();
      }
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onEdeleteDontwant() {
    this.openConfirmDeleteDialog();
    this.analytics.logEvent('delete_dontwant', { id: this.dontwantData.id });
  }

  openConfirmDeleteDialog() {
    const dialogRef = this.dialogService.createDialogRef({
      component: ConfirmDialogComponent,
      width: '300px',
      data: {
        textContent: `Naozaj si prajete zamať vrátenie? Ozajnaozaj?`,
        title: 'Zmazať vrátenie',
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dontwantsService.deleteDontwant(this.dontwantData.id);
        this.onNoClick();
      }
    });
  }

  copyToClipboard() {
    this.helper.copyToClipboard(this.dontwantData);
  }

  ngOnDestroy() {
    this.editDontwantFormChanges$.unsubscribe();
    this.technicians$.unsubscribe();
  }

}
