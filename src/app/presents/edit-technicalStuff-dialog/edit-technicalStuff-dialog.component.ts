import {
  Component,
  OnInit,
  Inject,
  OnDestroy,
  ViewChildren,
  QueryList,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';

import { Subscription, Observable, merge } from 'rxjs';
import { take } from 'rxjs/operators';


import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AngularFireAnalytics } from '@angular/fire/analytics';

import { DateService } from '../../shared/services/date.service';
import { DataService } from '../../shared/data/data.service';
import { UserService } from 'src/app/shared/services/user.service';
import { HelperService } from '../../shared/services/helper.service';
import { DialogService } from '../../shared/services/dialog.service';
import { DictionaryService } from '../../shared/services/dictionary.service';
import { User, EmployeeInfo } from 'src/app/shared/shared.model';
import { technicalStuff } from '../present.model';
import { PresentsService } from '../presents.service';

import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { InputtechnicalStuffFormGroupComponent } from 'src/app/shared/input-technicalStuff-form-group/input-technicalStuff-form-group.component';

@Component({
  selector: 'app-edit-technicalStuff-dialog',
  templateUrl: './edit-technicalStuff-dialog.component.html',
  styleUrls: ['./edit-technicalStuff-dialog.component.scss']
})
export class EdittechnicalStuffDialogComponent implements OnInit, OnDestroy {
  @ViewChildren(InputtechnicalStuffFormGroupComponent) inputtechnicalStuffGroups: QueryList<InputtechnicalStuffFormGroupComponent>;
  private propertiesToCompare = [
    'technicalStuff', 'technicalStuffCorresponding', 'technicalStuffCorrespondingAnonym', 'type', 'otherTechnicalStuff', 'technicalStuffAnonym', 'typeAnonym', 'otherTechnicalStuffAnonym',
    'dateAdded', 'assignedTo', 'customerName', 'customerPhone', 'note',
    'status', 'isDefective',
  ];

  private technicians$: Subscription;

  public user: User;

  public edittechnicalStuffForm: FormGroup;
  public displayTechnicians: EmployeeInfo[] = [];
  public isEditMode: boolean = this.data.mode === 'edit';
  public isDeletable: boolean = false;

  public technicalStuffOriginCorrespondingVisible: boolean = false;
  public disabletechnicalStuffOriginCorresponding: boolean = false; // TODO: inak vymysli
  public technicalStuffAnonymCorrespondingVisible: boolean = false;
  public disabletechnicalStuffAnonymCorresponding: boolean = false; // TODO: inak vymysli

  public correspondingtechnicalStuffOptions = [];
  public correspondingtechnicalStuffDisplayOptions: string[] = [];
  public correspondingtechnicalStuffTags = [];

  private technicalStuffData: technicalStuff;

  private custoperPhoneChange$: Observable<any>;
  private custoperNameChange$: Observable<any>;
  private technicalStuffAnonymChange$: Observable<any>;


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<EdittechnicalStuffDialogComponent>,
    private fb: FormBuilder,
    private analytics: AngularFireAnalytics,
    private dateService: DateService,
    private dataService: DataService,
    private presentsService: PresentsService,
    private userService: UserService,
    private helper: HelperService,
    private dialogService: DialogService,
    public dictionary: DictionaryService,
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {
    this.technicalStuffData = this.data.technicalStuffData;
    this.user = this.userService.getUser();
    this.isDeletable = this.isEditMode && !this.user.isTechnician && this.technicalStuffData.status === 'unfulfilled';
    console.warn('data', this.data);
    console.warn('pred', JSON.parse(JSON.stringify(this.technicalStuffData)));

    this.technicalStuffOriginCorrespondingVisible = !!this.technicalStuffData.corresponding;
    this.disabletechnicalStuffOriginCorresponding = this.technicalStuffData.tags && this.technicalStuffData.tags.includes('corresponding-child');

    this.technicalStuffAnonymCorrespondingVisible = !!this.technicalStuffData.correspondingAnonym;
    this.disabletechnicalStuffAnonymCorresponding = this.technicalStuffData.tags && this.technicalStuffData.tags.includes('corresponding-child');

    this.edittechnicalStuffForm = this.fb.group({
      technicalStuffPresent: [
        {
          value: {
            technicalStuff: this.technicalStuffData.technicalStuff || null,
            type: this.technicalStuffData.type || null,
            otherTechnicalStuff: this.technicalStuffData.otherTechnicalStuff || null,
          },
          disabled: this.isEditMode,
        },
        [ Validators.required ],
      ],
      technicalStuffAnonym: [{
        value: {
          technicalStuff: this.technicalStuffData.technicalStuffAnonym || null,
          type: this.technicalStuffData.typeAnonym || null,
          otherTechnicalStuff: this.technicalStuffData.otherTechnicalStuffAnonym || null,
        },
        disabled: false,
      }],
      dateAdded: [
        {
          value: this.getDateValue(),
          disabled: this.isEditMode,
        },
        [ Validators.required, this.dateService.validateDate(this.dateService) ],
      ],
      assignedAt: [
        {
          value: this.technicalStuffData.assignedAt ? this.dateService.getValidDateStringFormatFromDate(this.technicalStuffData.assignedAt) : null,
          disabled: true,
        },
      ],
      assignedTo: [
        {
          value: this.technicalStuffData.assignedTo ? this.technicalStuffData.assignedTo.uid : null,
          disabled: this.user.isTechnician,
        },
      ],
      customerName: [
        this.technicalStuffData.customerName || null,
      ],
      customerPhone: [
        this.technicalStuffData.customerPhone || null,
        [ Validators.pattern('^[9]{1}[0-9]{2}[ ]{0,1}[0-9]{3}[ ]{0,1}[0-9]{3}$') ],
      ],
      technicalStuffCorresponding: [{
        value: {
          technicalStuff: this.technicalStuffData.corresponding && this.technicalStuffData.corresponding.technicalStuff ? this.technicalStuffData.corresponding.technicalStuff : null,
          type: this.technicalStuffData.corresponding && this.technicalStuffData.corresponding.type ? this.technicalStuffData.corresponding.type : null,
          otherTechnicalStuff: this.technicalStuffData.corresponding && this.technicalStuffData.corresponding.otherTechnicalStuff ? this.technicalStuffData.corresponding.otherTechnicalStuff : null,
          id: this.technicalStuffData.corresponding && this.technicalStuffData.corresponding.id ? this.technicalStuffData.corresponding.id : null,
        },
        disabled: false,
      }],
      technicalStuffAnonymCorresponding: [{
        value: {
          technicalStuff: this.technicalStuffData.correspondingAnonym && this.technicalStuffData.correspondingAnonym.technicalStuff
            ? this.technicalStuffData.correspondingAnonym.technicalStuff
            : null,
          type: this.technicalStuffData.correspondingAnonym && this.technicalStuffData.correspondingAnonym.type
            ? this.technicalStuffData.correspondingAnonym.type
            : null,
          otherTechnicalStuff: this.technicalStuffData.correspondingAnonym && this.technicalStuffData.correspondingAnonym.otherTechnicalStuff
            ? this.technicalStuffData.correspondingAnonym.otherTechnicalStuff
            : null,
        },
        disabled: false,
      }],
      note: [ this.technicalStuffData.note || null ],
      isDefective: [
        this.technicalStuffData.isDefective !== undefined || this.technicalStuffData.isDefective !== null ? this.technicalStuffData.isDefective : false,
      ],
    });

    this.getTechnicians();
    if (this.assignedTo.value) {
      this.setValidatorsForSecondStepFields();
    }

    this.custoperPhoneChange$ = this.customerPhone.valueChanges;
    this.custoperNameChange$ = this.customerName.valueChanges;
    this.technicalStuffAnonymChange$ = this.technicalStuffAnonym.valueChanges;

    merge(
      this.custoperPhoneChange$,
      this.custoperNameChange$,
      this.technicalStuffAnonymChange$,
    ).pipe(take(1)).subscribe(() => {
      this.setValidatorsForSecondStepFields();
    });
  }

  get technicalStuffPresent() { return this.edittechnicalStuffForm.get('technicalStuffPresent'); }
  get technicalStuffAnonym() { return this.edittechnicalStuffForm.get('technicalStuffAnonym'); }
  get dateAdded() { return this.edittechnicalStuffForm.get('dateAdded'); }
  get assignedTo() { return this.edittechnicalStuffForm.get('assignedTo'); }
  get customerName() { return this.edittechnicalStuffForm.get('customerName'); }
  get customerPhone() { return this.edittechnicalStuffForm.get('customerPhone'); }
  get technicalStuffCorresponding() { return this.edittechnicalStuffForm.get('technicalStuffCorresponding'); }
  get technicalStuffAnonymCorresponding() { return this.edittechnicalStuffForm.get('technicalStuffAnonymCorresponding'); }

  hasRequiredValidator(controlName: string): boolean {
    const control = this.edittechnicalStuffForm.get(controlName);
    const validator = control && control.validator ? control.validator({} as AbstractControl) : undefined;
    return validator && validator.required ? true : false;
  }

  setValidatorsForSecondStepFields() {
    if (!this.isEditMode) {
      return;
    }

    this.assignedTo.setValidators(Validators.required);
    this.customerName.setValidators(Validators.required);
    this.customerPhone.setValidators([ Validators.required, Validators.pattern('^[9]{1}[0-9]{2}[ ]{0,1}[0-9]{3}[ ]{0,1}[0-9]{3}$')]);
    this.technicalStuffAnonym.setValidators(Validators.required);
    this.edittechnicalStuffForm.updateValueAndValidity();
    if (!this.inputtechnicalStuffGroups) {
      return;
    }

    // find technicalStuffAnonym component and call its method for setting validation
    this.inputtechnicalStuffGroups.forEach(comp => {
      if (comp && comp.formControlName === 'technicalStuffAnonym') {
        comp.setValidators();
      }
    });
  }

  getFormValidationErrors() {
    this.edittechnicalStuffForm.markAllAsTouched();
    this.inputtechnicalStuffGroups.forEach(comp => {
      comp.technicalStuffForm.markAllAsTouched();
    });
  }

  getTechnicians() {
    this.technicians$ = this.dataService.getTechnicians().subscribe((technicians: EmployeeInfo[]) => {
      this.displayTechnicians = this.helper.getTechniciansWithEmptyOption(technicians);
      this.displayTechnicians = this.helper.getTechniciansWithUnofficial(this.technicalStuffData.assignedTo, this.displayTechnicians);
    });
  }

  getDateValue(): string {
    return this.technicalStuffData.dateAdded
      ? this.dateService.getValidDateStringFormatFromDate(this.technicalStuffData.dateAdded)
      : this.dateService.getCurrentDateAsString();
  }

  onSavetechnicalStuff() {
    if (this.edittechnicalStuffForm.invalid) {
      this.getFormValidationErrors();
      return;
    }
    const { technicalStuffPayload, historyObject } = this.getPayloads();

    if (this.data.mode === 'edit') {
      this.edittechnicalStuff(technicalStuffPayload, historyObject);
    } else {
      this.createtechnicalStuff(technicalStuffPayload as technicalStuff);
    }
    this.dialogRef.close();
  }

  getPayloads() {
    const rawData = this.edittechnicalStuffForm.getRawValue();
    const transformedForm = this.transformFormDataToRequestData(rawData);
    const originWithDates = this.transfromtDatesToDateObjects(this.technicalStuffData);
    const changesObj: any = this.helper.getChangesObject(originWithDates, transformedForm, this.propertiesToCompare);
    const technicalStuffPayload = { ...transformedForm };

    if (!this.technicalStuffData.createdBy) {
      technicalStuffPayload.createdBy = this.helper.getEmployeeInfo(this.user);
    }
    if (!technicalStuffPayload.assignedTo && this.technicalStuffData.assignedTo) {
      technicalStuffPayload.assignedAt = null;
    } else if ((!this.technicalStuffData.assignedTo && technicalStuffPayload.assignedTo) || (this.technicalStuffData.assignedTo !== technicalStuffPayload.assignedTo)) {
      technicalStuffPayload.assignedAt = this.dateService.getCurrentDateAsDate();
    }

    const historyObject = this.helper.getHistoryObj(changesObj, this.user);


    return {
      technicalStuffPayload,
      historyObject,
    };

  }

  transformFormDataToRequestData(data) {
    const transformed: any = {};

    if (data.technicalStuffPresent && data.technicalStuffPresent.technicalStuff) {
      transformed.technicalStuff = data.technicalStuffPresent.technicalStuff;
      transformed.type = data.technicalStuffPresent.type;
      transformed.otherTechnicalStuff = data.technicalStuffPresent.otherTechnicalStuff;
    }

    if (data.technicalStuffAnonym && data.technicalStuffAnonym.technicalStuff) {
      transformed.technicalStuffAnonym = data.technicalStuffAnonym.technicalStuff;
      transformed.typeAnonym = data.technicalStuffAnonym.type;
      transformed.otherTechnicalStuffAnonym = data.technicalStuffAnonym.otherTechnicalStuff;
    }

    if (data.technicalStuffCorresponding && data.technicalStuffCorresponding.technicalStuff) {
      transformed.corresponding = data.technicalStuffCorresponding;
      this.correspondingtechnicalStuffTags = [];
    } else if (this.technicalStuffData.corresponding) {
      transformed.corresponding = null;
    }

    if (data.technicalStuffAnonymCorresponding && data.technicalStuffAnonymCorresponding.technicalStuff) {
      transformed.correspondingAnonym = data.technicalStuffAnonymCorresponding;
      // this.correspondingtechnicalStuffTags = [];
    } else if (this.technicalStuffData.correspondingAnonym) {
      transformed.correspondingAnonym = null;
    }

    if (data.dateAdded) {
      transformed.dateAdded = this.dateService.getValidDateObjectFromString(data.dateAdded);
    }

    if (data.assignedAt) {
      transformed.assignedAt = this.dateService.getValidDateObjectFromString(data.assignedAt);
    }


    if (data.assignedTo) {
      const assignedTechnician = this.displayTechnicians.find((technician) => technician.uid === data.assignedTo);
      transformed.assignedTo = this.helper.getEmployeeInfo(assignedTechnician);
    } else {
      transformed.assignedTo = null;
    }

    transformed.createdBy = this.helper.getEmployeeInfo(this.data.mode === 'create' ? this.user : this.technicalStuffData.createdBy),
    transformed.customerName = data.customerName;
    transformed.customerPhone = data.customerPhone;
    transformed.note = data.note;
    transformed.isDefective = data.isDefective;
    transformed.status = this.isFulfilled(transformed) ? 'fulfilled' : 'unfulfilled';
    // console.warn('transformed', transformed);

    return transformed;
  }

  transfromtDatesToDateObjects(data) {
    const result = JSON.parse(JSON.stringify(data));
    if (result.dateAdded) {
      result.dateAdded = this.dateService.getValidDateObjectFromString(
        this.dateService.getValidDateStringFormatFromDate(result.dateAdded)
        );
    }

    if (result.assignedAt) {
      result.assignedAt = this.dateService.getValidDateObjectFromString(
        this.dateService.getValidDateStringFormatFromDate(result.assignedAt)
      );
    }

    return result;
  }

  createtechnicalStuff(technicalStuffPayload: technicalStuff) {
    this.presentsService.createtechnicalStuff(technicalStuffPayload);
    this.analytics.logEvent('create_technicalStuff');
  }

  edittechnicalStuff(technicalStuffPayload, historyPayload): void {
    this.presentsService.edittechnicalStuff({
      technicalStuff: technicalStuffPayload,
      history: historyPayload,
      technicalStuffId: this.technicalStuffData.id,
      correspondingtechnicalStuffTags: this.correspondingtechnicalStuffTags,
      deleteCorrespondingRelationship: (!technicalStuffPayload.corresponding && this.technicalStuffData.corresponding) ? this.technicalStuffData.corresponding.id : null,
      lostFulfillment: (this.technicalStuffData.status === 'fulfilled' && technicalStuffPayload.status === 'unfulfilled') ? true : false,
    });
    this.analytics.logEvent('edit_technicalStuff', { id: this.technicalStuffData.id });
  }

  isFulfilled(technicalStuffData: technicalStuff): boolean {
    return (
      !!technicalStuffData.technicalStuff &&
      !!technicalStuffData.type &&
      !!technicalStuffData.otherTechnicalStuff &&
      !!technicalStuffData.createdBy &&
      !!technicalStuffData.assignedTo &&
      !!technicalStuffData.dateAdded &&
      !!technicalStuffData.customerName &&
      !!technicalStuffData.customerPhone &&
      !!technicalStuffData.technicalStuffAnonym &&
      !!technicalStuffData.typeAnonym &&
      !!technicalStuffData.otherTechnicalStuffAnonym
    );
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onDeletetechnicalStuff() {
    this.openConfirmDeleteDialog();
  }

  openConfirmDeleteDialog() {
    const dialogRef = this.dialogService.createDialogRef({
      component: ConfirmDialogComponent,
      width: '300px',
      data: {
        textContent: `Naozaj si prajete zamať technicalStuff? Ozajnaozaj?`,
        title: 'Zmazať technicalStuff',
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.presentsService.deletetechnicalStuff(this.technicalStuffData.id);
        this.analytics.logEvent('delete_technicalStuff', { id: this.technicalStuffData.id });
        this.onNoClick();
      }
    });
  }

  onResettechnicalStuff() {
    this.openConfirmResetStatusDialog();
  }

  openConfirmResetStatusDialog() {
    const dialogRef = this.dialogService.createDialogRef({
      component: ConfirmDialogComponent,
      width: '300px',
      data: {
        title: 'Resetovať technicalStuff',
        textContent: `Naozaj si prajete resetovať technicalStuff?
          Vymaže sa meno zákazníka, tel. č. služby, prípadne technicalStuff výmeny, a technicalStuff bude opäť evidované ako nevybavené.`,
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.customerName.setValue('');
        this.customerPhone.setValue('');
        this.edittechnicalStuffForm.get('technicalStuffAnonym').setValue('');
        const { technicalStuffPayload, historyObject } = this.getPayloads();
        console.warn('technicalStuffPayload', technicalStuffPayload);
        console.warn('historyObject', historyObject);
        this.presentsService.edittechnicalStuff({
          technicalStuff: technicalStuffPayload,
          history: historyObject,
          technicalStuffId: this.technicalStuffData.id,
          correspondingtechnicalStuffTags: this.correspondingtechnicalStuffTags,
          lostFulfillment: true,
        });
        this.analytics.logEvent('reset_technicalStuff', { id: this.technicalStuffData.id });
        this.onNoClick();
      }
    });
  }

  addtechnicalStuffOriginCorresponding() {
    this.technicalStuffOriginCorrespondingVisible = true;
  }

  addtechnicalStuffAnonymCorresponding() {
    this.technicalStuffAnonymCorrespondingVisible = true;
  }

  copyToClipboard() {
    this.helper.copyToClipboard(this.technicalStuffData);
  }

  ngOnDestroy() {
    this.technicians$.unsubscribe();
  }

}
