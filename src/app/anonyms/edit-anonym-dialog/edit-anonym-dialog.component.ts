import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AngularFireAnalytics } from '@angular/fire/analytics';

import { DateService } from '../../shared/services/date.service';
import { HelperService } from '../../shared/services/helper.service';
import { UserService } from 'src/app/shared/services/user.service';
import { DialogService } from '../../shared/services/dialog.service';
import { DictionaryService } from '../../shared/services/dictionary.service';
import { AnonymsService } from '../anonyms.service';

import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { InputtechnicalStuffFormGroupComponent } from 'src/app/shared/input-technicalStuff-form-group/input-technicalStuff-form-group.component';
import {
  DestroyService,
  EDIT_DIALOG_FORM,
  EDIT_DIALOG_PROVIDERS,
} from './edit-anonym-dialog.providers';
import { EditAnonymDialogService } from './edit-anonym-dialog.service';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-edit-anonym-dialog',
  templateUrl: './edit-anonym-dialog.component.html',
  styleUrls: ['./edit-anonym-dialog.component.scss'],
  providers: EDIT_DIALOG_PROVIDERS,
  changeDetection: ChangeDetectionStrategy.OnPush, // <-- a MUST
})
export class EditAnonymDialogComponent {
  readonly user = this.userService.getUser();
  readonly isDispatched = this.data.anonymData.dispatched;
  readonly hasCorrespondingtechnicalStuff = !!this.data.anonymData
    .correspondingtechnicalStuff;
  readonly hasCorrespondingtechnicalStuffAnonym = !!this.data.anonymData
    .correspondingtechnicalStuffAnonym;

  @ViewChildren(InputtechnicalStuffFormGroupComponent)
  private readonly inputtechnicalStuffGroups: QueryList<
    InputtechnicalStuffFormGroupComponent
  > = new QueryList(); // <-- so you do not have 'undefined' initially

  constructor(
    @Inject(EDIT_DIALOG_FORM) readonly editAnonymForm: FormGroup,
    @Inject(MAT_DIALOG_DATA) private readonly data: any,
    private readonly destroy$: DestroyService,
    private readonly dialogRef: MatDialogRef<EditAnonymDialogComponent>,
    private readonly analytics: AngularFireAnalytics,
    private readonly dateService: DateService,
    private readonly anonymService: AnonymsService,
    private readonly userService: UserService,
    private readonly helper: HelperService,
    private readonly dialogService: DialogService,
    private readonly editAnonymDialogService: EditAnonymDialogService,
    readonly dictionary: DictionaryService,
  ) {
    // No need for ngOnInit hook. I prefer constructor if you do not need inputs.
    // This way there is no time between component creation and initialization.
    // It might matter for types with strictPropertyInitialization TypeScript option
    dialogRef.disableClose = true;
    this.manageDispatchEligibility();
    this.initSubscriptions();
  }

  get technicalStuff() {
    return this.editAnonymForm.get('technicalStuffAnonym');
  }
  get technicalStuff2() {
    return this.editAnonymForm.get('technicalStuffPresent');
  }
  get customerName() {
    return this.editAnonymForm.get('customerName');
  }
  get customerPhone() {
    return this.editAnonymForm.get('customerPhone');
  }
  get sp() {
    return this.editAnonymForm.get('sp');
  }
  get hsDispatchDate() {
    return this.editAnonymForm.get('hsDispatchDate');
  }
  get hsDispatchDateTechnician() {
    return this.editAnonymForm.get('hsDispatchDateTechnician');
  }

  getFormValidationErrors() {
    this.editAnonymForm.markAllAsTouched();
    this.inputtechnicalStuffGroups.forEach((comp) => {
      comp.technicalStuffForm.markAllAsTouched();
    });
  }

  onSaveAnonym() {
    if (this.editAnonymForm.invalid) {
      this.getFormValidationErrors();
      return;
    }

    const payload = this.editAnonymDialogService.getPayload(
      this.editAnonymForm.getRawValue(),
    );

    if (!payload) {
      return;
    }

    this.anonymService.editAnonymNew(payload);
    this.analytics.logEvent('edit_anonym', { id: this.data.anonymData.id });
    this.dialogRef.close(payload);
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

    dialogRef
      .afterClosed()
      .pipe(
        takeUntil(this.destroy$),
        filter((v) => v),
      )
      .subscribe(() => {
        this.editAnonymForm.enable();
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

    dialogRef
      .afterClosed()
      .pipe(
        takeUntil(this.destroy$),
        filter((v) => v),
      )
      .subscribe(() => {
        this.anonymService.editAnonymNew({
          anonym: {
            hsDispatchDate: null,
            dispatched: false,
          },
          anonymId: this.data.anonymData.id,
        });
        this.onNoClick();
      });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onEdeleteExhcange() {
    this.openConfirmDeleteDialog();
  }

  copyToClipboard() {
    this.helper.copyToClipboard(this.data.anonymData, true);
  }

  private openConfirmDeleteDialog() {
    const dialogRef = this.dialogService.createDialogRef({
      component: ConfirmDialogComponent,
      width: '300px',
      data: {
        textContent: `Naozaj si prajete zamať výmenu? Ozajnaozaj?`,
        title: 'Zmazať výmenu',
      },
    });

    dialogRef
      .afterClosed()
      .pipe(
        takeUntil(this.destroy$),
        filter((v) => v),
      )
      .subscribe(() => {
        this.anonymService.deleteAnonym(this.data.anonymData.id);
        this.analytics.logEvent('delete_anonym', {
          id: this.data.anonymData.id,
        });
        this.onNoClick();
      });
  }

  // Do not forget to make methods private
  private manageDispatchEligibility() {
    if (this.user.isTechnician) {
      this.hsDispatchDate.disable({ emitEvent: false });

      return;
    }

    const isDispatchDisabled =
      !this.editAnonymForm ||
      this.technicalStuff.invalid ||
      this.technicalStuff2.invalid ||
      this.customerName.invalid ||
      this.customerPhone.invalid;

    if (isDispatchDisabled) {
      this.hsDispatchDate.disable({ emitEvent: false });
    } else {
      this.hsDispatchDate.enable({ emitEvent: false });
    }
  }

  private initSubscriptions() {
    this.editAnonymForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.manageDispatchEligibility();
      });

    this.hsDispatchDate.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        // I don't know the case, but setting Validators imperatively is bad practice
        if (value && !this.hsDispatchDate.validator) {
          this.hsDispatchDate.setValidators(
            this.dateService.validateDate(this.dateService),
          );
        } else if (!value) {
          this.hsDispatchDate.setValidators(
            this.dateService.validateDate(null),
          );
        }

        if (this.hsDispatchDate.valid && this.hsDispatchDate.value) {
          this.sp.setValidators([
            Validators.required,
            Validators.pattern('^\\d{7}|-$'),
          ]);
        }
      });
  }
}
