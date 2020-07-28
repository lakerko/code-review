import {
  Component,
  OnInit,
  Inject,
  OnDestroy,
  ViewChildren,
  QueryList,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Subscription } from 'rxjs';

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AngularFireAnalytics } from '@angular/fire/analytics';

import { DateService } from '../../shared/services/date.service';
import { DataService } from '../../shared/data/data.service';
import { HelperService } from '../../shared/services/helper.service';
import { UserService } from 'src/app/shared/services/user.service';
import { DialogService } from '../../shared/services/dialog.service';
import { DictionaryService } from '../../shared/services/dictionary.service';
import { EmployeeInfo, User } from 'src/app/shared/shared.model';
import { AnonymsService } from '../anonyms.service';

import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { InputtechnicalStuffFormGroupComponent } from 'src/app/shared/input-technicalStuff-form-group/input-technicalStuff-form-group.component';

@Component({
  selector: 'app-edit-anonym-dialog',
  templateUrl: './edit-anonym-dialog.component.html',
  styleUrls: ['./edit-anonym-dialog.component.scss']
})
export class EditAnonymDialogComponent implements OnInit, OnDestroy {
  @ViewChildren(InputtechnicalStuffFormGroupComponent) inputtechnicalStuffGroups: QueryList<InputtechnicalStuffFormGroupComponent>;
  private propertiesToCompare = [
    'technicalStuff2', 'type', 'otherTechnicalStuff',
    'technicalStuff', 'typeAnonym', 'otherTechnicalStuffAnonym',
    'correspondingtechnicalStuff', 'correspondingtechnicalStuffType', 'correspondingtechnicalStuffotherTechnicalStuff',
    'correspondingtechnicalStuffAnonym', 'correspondingtechnicalStuffAnonymType', 'correspondingtechnicalStuffAnonymotherTechnicalStuff',
    'assignedTo', 'customerName', 'customerPhone', 'note', 'hsDispatchDate', 'hsDispatchDateTechnician', 'sp',
  ];

  private editAnonymFormChanges$: Subscription;
  private technicians$: Subscription;
  public user: User;
  public editAnonymForm: FormGroup;
  public displayTechnicians: EmployeeInfo[] = [];

  public hasCorrespondingtechnicalStuff: boolean = false;
  public hasCorrespondingtechnicalStuffAnonym: boolean = false;

  private anonymData;

  public isDispatched: boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private dialogRef: MatDialogRef<EditAnonymDialogComponent>,
    private fb: FormBuilder,
    private analytics: AngularFireAnalytics,
    private dateService: DateService,
    private dataService: DataService,
    private anonymService: AnonymsService,
    private userService: UserService,
    private helper: HelperService,
    private dialogService: DialogService,
    public dictionary: DictionaryService,
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {
    this.anonymData = this.data.anonymData;
    this.isDispatched = this.anonymData.dispatched;
    this.user = this.userService.getUser();

    console.warn('data', this.data);

    this.hasCorrespondingtechnicalStuff = !!this.anonymData.correspondingtechnicalStuff;
    this.hasCorrespondingtechnicalStuffAnonym = !!this.anonymData.correspondingtechnicalStuffAnonym;

    this.editAnonymForm = this.fb.group({
      technicalStuffPresent: [
        {
          value: {
            technicalStuff: this.anonymData.technicalStuff2 || null,
            type: this.anonymData.type || null,
            otherTechnicalStuff: this.anonymData.otherTechnicalStuff || null,
          },
          disabled: true,
        },
        [ Validators.required ],
      ],
      technicalStuffAnonym: [
        {
          value: {
            technicalStuff: this.anonymData.technicalStuff || null,
            type: this.anonymData.typeAnonym || null,
            otherTechnicalStuff: this.anonymData.otherTechnicalStuffAnonym || null,
          },
          disabled: false,
        },
        [ Validators.required ],
      ],
      technicalStuffCorresponding: [{
        value: {
          technicalStuff: this.anonymData.correspondingtechnicalStuff || null,
          type: this.anonymData.correspondingtechnicalStuffType || null,
          otherTechnicalStuff: this.anonymData.correspondingtechnicalStuffotherTechnicalStuff || null,
          id: this.anonymData.correspondingtechnicalStuffId || null,
        },
        disabled: false,
      }],
      technicalStuffAnonymCorresponding: [{
        value: {
          technicalStuff: this.anonymData.correspondingtechnicalStuffAnonym || null,
          type: this.anonymData.correspondingtechnicalStuffAnonymType || null,
          otherTechnicalStuff: this.anonymData.correspondingtechnicalStuffAnonymotherTechnicalStuff || null,
        },
        disabled: false,
      }],
      hsDispatchDate: [
        {
          value: this.anonymData.hsDispatchDate
            ? this.dateService.getValidDateStringFormatFromDate(this.anonymData.hsDispatchDate)
            : null,
          disabled: this.user.isTechnician,
        },
        [ this.dateService.validateDate(this.dateService) ],
      ],
      hsDispatchDateTechnician: [
        this.anonymData.hsDispatchDateTechnician
          ? this.dateService.getValidDateStringFormatFromDate(this.anonymData.hsDispatchDateTechnician)
          : null,
        [ this.dateService.validateDate(this.dateService) ],
      ],
      createdAt: [
        {
          value: this.anonymData.createdAt ? this.dateService.getValidDateStringFormatFromDate(this.anonymData.createdAt) : null,
          disabled: true,
        }
      ],
      assignedTo: [
        {
          value: this.anonymData.assignedTo ? this.anonymData.assignedTo.uid : null,
          disabled: this.user.isTechnician,
        }
      ],
      customerName: [
        this.anonymData.customerName,
        [ Validators.required ],
      ],
      customerPhone: [
        this.anonymData.customerPhone,
        [ Validators.required, Validators.pattern('^[9]{1}[0-9]{2}[ ]{0,1}[0-9]{3}[ ]{0,1}[0-9]{3}$')],
      ],
      sp: [
        {
          value: this.anonymData.sp || null,
          disabled: this.user.isTechnician,
        },
      ],
      note: [ this.anonymData.note || null ],
    });

    this.getTechnicians();

    this.manageDispatchEligibility();

    if (this.anonymData.hsDispatchDate) {
      this.editAnonymForm.disable();
    }

    this.editAnonymFormChanges$ = this.editAnonymForm.valueChanges.subscribe((value: string) => {
      this.manageDispatchEligibility();
    });

    this.hsDispatchDate.valueChanges.subscribe(value => {
      if (value && !this.hsDispatchDate.validator) {
        this.hsDispatchDate.setValidators(this.dateService.validateDate(this.dateService));
      } else if (!value) {
        this.hsDispatchDate.setValidators(this.dateService.validateDate(null));
      }

      if (this.hsDispatchDate.valid && this.hsDispatchDate.value) {
        this.sp.setValidators([ Validators.required, Validators.pattern('^\\d{7}|-$') ]);
      }
    });
  }

  getTechnicians() {
    this.technicians$ = this.dataService.getTechnicians().subscribe((technicians: EmployeeInfo[]) => {
      this.displayTechnicians = this.helper.getTechniciansWithEmptyOption(technicians);
      this.displayTechnicians = this.helper.getTechniciansWithUnofficial(this.anonymData.assignedTo, this.displayTechnicians);
    });
  }

  get technicalStuff() { return this.editAnonymForm.get('technicalStuffAnonym'); }
  get technicalStuff2() { return this.editAnonymForm.get('technicalStuffPresent'); }
  get customerName() { return this.editAnonymForm.get('customerName'); }
  get customerPhone() { return this.editAnonymForm.get('customerPhone'); }
  get sp() { return this.editAnonymForm.get('sp'); }
  get hsDispatchDate() { return this.editAnonymForm.get('hsDispatchDate'); }
  get hsDispatchDateTechnician() { return this.editAnonymForm.get('hsDispatchDateTechnician'); }

  getFormValidationErrors() {
    this.editAnonymForm.markAllAsTouched();
    this.inputtechnicalStuffGroups.forEach(comp => {
      comp.technicalStuffForm.markAllAsTouched();
    });
  }

  manageDispatchEligibility() {
    if (this.user.isTechnician) {
      this.hsDispatchDate.disable({ emitEvent: false });
      return;
    }

    const isDispatchDisabled = !this.editAnonymForm || (
      this.technicalStuff.invalid ||
      this.technicalStuff2.invalid ||
      this.customerName.invalid ||
      this.customerPhone.invalid
    );

    if (isDispatchDisabled) {
      this.hsDispatchDate.disable({ emitEvent: false });
    } else {
      this.hsDispatchDate.enable({ emitEvent: false });
    }
  }

  onSaveAnonym() {
    if (this.editAnonymForm.invalid) {
      this.getFormValidationErrors();
      return;
    }

    const rawData = this.editAnonymForm.getRawValue();
    const transformedForm = this.transformFormDataToRequestData(rawData);
    const originWithDates = this.transfromtDatesToDateObjects(this.getParsableData(this.anonymData));
    console.warn('rawData', rawData);
    console.warn('transformedForm', transformedForm);
    console.warn('originWithDates', originWithDates);

    const changesObj = this.helper.getChangesObject(
      originWithDates, transformedForm, this.propertiesToCompare
    );
    const changes = this.helper.getKeyValuePairsFromChanges(changesObj);

    if (
      changesObj &&
      changesObj.hsDispatchDate &&
      changesObj.hsDispatchDate.newValue &&
      !changesObj.hsDispatchDate.oldValue
    ) {
      changes.dispatched = true;
    }

    if (
      changesObj &&
      changesObj.hsDispatchDateTechnician &&
      changesObj.hsDispatchDateTechnician.newValue &&
      !changesObj.hsDispatchDateTechnician.oldValue
    ) {
      changes.dispatchedByTechnician = true;
    }

    if (this.anonymData.hsDispatchDate && changesObj.hsDispatchDate && !changesObj.hsDispatchDate.newValue) {
      changes.hsDispatchDate = null;
    }

    if (
      this.anonymData.hsDispatchDateTechnician &&
      changesObj.hsDispatchDateTechnician &&
      !changesObj.hsDispatchDateTechnician.newValue
    ) {
      changes.hsDispatchDateTechnician = null;
    }

    const payload: any = {
      anonym: changes,
      anonymId: this.anonymData.id,
      technicalStuffData: null,
    };
    console.warn('changesObj', changesObj);
    console.warn('anonymChanges', changes);

    if (!changesObj || !changes) {
      return;
    }

    if (changes.technicalStuff2) {
      payload.technicalStuffInventory = {
        technicalStuff: changes.technicalStuff2,
        type: changes.type || transformedForm.type,
        otherTechnicalStuff: changes.otherTechnicalStuff || transformedForm.otherTechnicalStuff,
      };
    }

    if (changes.technicalStuff) {
      payload.technicalStuffAnonym = {
        technicalStuff: changes.technicalStuff,
        type: changes.typeAnonym || transformedForm.typeAnonym,
        otherTechnicalStuff: changes.otherTechnicalStuffAnonym || transformedForm.otherTechnicalStuffAnonym,
      };
    }

    if (changes.correspondingtechnicalStuff) {
      payload.correspondingtechnicalStuff = {
        technicalStuff: changes.correspondingtechnicalStuff,
        type: changes.correspondingtechnicalStuffType || transformedForm.correspondingtechnicalStuffType,
        otherTechnicalStuff: changes.correspondingtechnicalStuffotherTechnicalStuff || transformedForm.correspondingtechnicalStuffotherTechnicalStuff,
      };
    }

    if (changes.correspondingtechnicalStuffAnonym) {
      payload.correspondingtechnicalStuffAnonym = {
        technicalStuff: changes.correspondingtechnicalStuffAnonym,
        type: changes.correspondingtechnicalStuffAnonymType || transformedForm.correspondingtechnicalStuffAnonymType,
        otherTechnicalStuff: changes.correspondingtechnicalStuffAnonymotherTechnicalStuff || transformedForm.correspondingtechnicalStuffAnonymotherTechnicalStuff,
      };
    }

    if (changes.customerName) {
      if (!payload.technicalStuffData) {
        payload.technicalStuffData = {};
      }
      payload.technicalStuffData.customerName = changes.customerName;
    }

    if (changes.customerPhone) {
      if (!payload.technicalStuffData) {
        payload.technicalStuffData = {};
      }
      payload.technicalStuffData.customerPhone = changes.customerPhone;
    }

    console.warn('payload', payload);

    this.anonymService.editAnonymNew(payload);
    this.analytics.logEvent('edit_anonym', { id: this.anonymData.id });
    this.dialogRef.close(payload);
  }

  transformFormDataToRequestData(data) {
    const transformed: any = {};

    if (data.technicalStuffPresent && data.technicalStuffPresent.technicalStuff) {
      transformed.technicalStuff2 = data.technicalStuffPresent.technicalStuff;
      transformed.type = data.technicalStuffPresent.type;
      transformed.otherTechnicalStuff = data.technicalStuffPresent.otherTechnicalStuff;
    }

    if (data.technicalStuffAnonym && data.technicalStuffAnonym.technicalStuff) {
      transformed.technicalStuff = data.technicalStuffAnonym.technicalStuff;
      transformed.typeAnonym = data.technicalStuffAnonym.type;
      transformed.otherTechnicalStuffAnonym = data.technicalStuffAnonym.otherTechnicalStuff;
    }


    if (data.technicalStuffCorresponding && data.technicalStuffCorresponding.technicalStuff) {
      transformed.correspondingtechnicalStuff = data.technicalStuffCorresponding.technicalStuff;
      transformed.correspondingtechnicalStuffType = data.technicalStuffCorresponding.type;
      transformed.correspondingtechnicalStuffotherTechnicalStuff = data.technicalStuffCorresponding.otherTechnicalStuff;
      // this.correspondingtechnicalStuffTags = [];
    } else if (this.anonymData.correspondingtechnicalStuff) {
      transformed.correspondingtechnicalStuff = null;
      transformed.correspondingtechnicalStuffType = null;
      transformed.correspondingtechnicalStuffotherTechnicalStuff = null;
    }

    if (data.technicalStuffAnonymCorresponding && data.technicalStuffAnonymCorresponding.technicalStuff) {
      transformed.correspondingtechnicalStuffAnonym = data.technicalStuffAnonymCorresponding.technicalStuff;
      transformed.correspondingtechnicalStuffAnonymType = data.technicalStuffAnonymCorresponding.type;
      transformed.correspondingtechnicalStuffAnonymotherTechnicalStuff = data.technicalStuffAnonymCorresponding.otherTechnicalStuff;
      // this.correspondingtechnicalStuffTags = [];
    } else if (this.anonymData.correspondingtechnicalStuffAnonym) {
      transformed.correspondingtechnicalStuffAnonym = null;
      transformed.correspondingtechnicalStuffAnonymType = null;
      transformed.correspondingtechnicalStuffAnonymotherTechnicalStuff = null;
    }

    if (data.hsDispatchDate) {
      transformed.hsDispatchDate = this.dateService.getValidDateObjectFromString(data.hsDispatchDate);
    }

    if (data.hsDispatchDateTechnician) {
      transformed.hsDispatchDateTechnician = this.dateService.getValidDateObjectFromString(data.hsDispatchDateTechnician);
    }

    if (data.assignedTo) {
      const assignedTechnician = this.displayTechnicians.find((technician) => technician.uid === data.assignedTo);
      transformed.assignedTo = this.helper.getEmployeeInfo(assignedTechnician);
    }

    transformed.customerName = data.customerName;
    transformed.customerPhone = data.customerPhone;
    transformed.note = data.note;
    transformed.sp = data.sp;
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

  allowEditing() {
    const dialogRef = this.dialogService.createDialogRef({
      component: ConfirmDialogComponent,
      width: '300px',
      data: {
        textContent: `Naozaj si prajete editovať ukončenú výmenu?`,
        title: 'Povoliť editáciu',
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.editAnonymForm.enable();
      }
    });
  }

  returnToOpened() {
    const dialogRef = this.dialogService.createDialogRef({
      component: ConfirmDialogComponent,
      width: '300px',
      data: {
        textContent: `Naozaj si prajete vrátiť ukončenú výmenu do neukončených?
        Zmaže sa dátum odoslania.`,
        title: 'Vrátiť ukončenú výmenu do neukončených',
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.anonymService.editAnonymNew({
          anonym: {
            hsDispatchDate: null,
            dispatched: false,
          },
          anonymId: this.anonymData.id,
        });
        this.onNoClick();
      }
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onEdeleteExhcange() {
    this.openConfirmDeleteDialog();
  }

  openConfirmDeleteDialog() {
    const dialogRef = this.dialogService.createDialogRef({
      component: ConfirmDialogComponent,
      width: '300px',
      data: {
        textContent: `Naozaj si prajete zamať výmenu? Ozajnaozaj?`,
        title: 'Zmazať výmenu',
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.anonymService.deleteAnonym(this.anonymData.id);
        this.analytics.logEvent('delete_anonym', { id: this.anonymData.id });
        this.onNoClick();
      }
    });
  }

  copyToClipboard() {
    this.helper.copyToClipboard(this.anonymData, true);
  }

  ngOnDestroy() {
    this.editAnonymFormChanges$.unsubscribe();
    this.technicians$.unsubscribe();
  }
}
