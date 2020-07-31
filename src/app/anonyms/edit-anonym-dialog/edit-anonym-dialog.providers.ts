import { Injectable, InjectionToken, OnDestroy, Provider } from '@angular/core';
import { Subject } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserService } from '../../shared/services/user.service';
import { DateService } from '../../shared/services/date.service';
import { PROPERTIES } from './edit-anonym-dialog.constants';
import { EditAnonymDialogService } from './edit-anonym-dialog.service';

/** A MUST HAVE utility class for every app */
@Injectable()
export class DestroyService extends Subject<void> implements OnDestroy {
  ngOnDestroy(): void {
    this.next();
    this.complete();
  }
}

/** Unfortunately we cannot add any strong types to FormGroup */
export const EDIT_DIALOG_FORM = new InjectionToken<FormGroup>('Dialog form');

export const EDIT_DIALOG_PROVIDERS: Provider[] = [
  DestroyService,
  EditAnonymDialogService,
  {
    provide: EDIT_DIALOG_FORM,
    deps: [FormBuilder, MAT_DIALOG_DATA, UserService, DateService],
    useFactory: formFactory,
  },
];

/** You should really add interface to your MAT_DIALOG_DATA */
export function formFactory(
  formBuilder: FormBuilder,
  { anonymData }: any,
  userService: UserService,
  dateService: DateService,
): FormGroup {
  const user = userService.getUser();
  const form = formBuilder.group({
    technicalStuffPresent: [
      {
        value: {
          technicalStuff: anonymData.technicalStuff2 || null,
          type: anonymData.type || null,
          otherTechnicalStuff: anonymData.otherTechnicalStuff || null,
        },
        disabled: true,
      },
      [Validators.required],
    ],
    technicalStuffAnonym: [
      {
        value: {
          technicalStuff: anonymData.technicalStuff || null,
          type: anonymData.typeAnonym || null,
          otherTechnicalStuff: anonymData.otherTechnicalStuffAnonym || null,
        },
        disabled: false,
      },
      [Validators.required],
    ],
    technicalStuffCorresponding: [
      {
        value: {
          technicalStuff: anonymData.correspondingtechnicalStuff || null,
          type: anonymData.correspondingtechnicalStuffType || null,
          otherTechnicalStuff:
            anonymData.correspondingtechnicalStuffotherTechnicalStuff || null,
          id: anonymData.correspondingtechnicalStuffId || null,
        },
        disabled: false,
      },
    ],
    technicalStuffAnonymCorresponding: [
      {
        value: {
          technicalStuff: anonymData.correspondingtechnicalStuffAnonym || null,
          type: anonymData.correspondingtechnicalStuffAnonymType || null,
          otherTechnicalStuff:
            anonymData.correspondingtechnicalStuffAnonymotherTechnicalStuff ||
            null,
        },
        disabled: false,
      },
    ],
    hsDispatchDate: [
      {
        value: anonymData.hsDispatchDate
          ? dateService.getValidDateStringFormatFromDate(
              anonymData.hsDispatchDate,
            )
          : null,
        disabled: user.isTechnician,
      },
      [dateService.validateDate(dateService)],
    ],
    hsDispatchDateTechnician: [
      anonymData.hsDispatchDateTechnician
        ? dateService.getValidDateStringFormatFromDate(
            anonymData.hsDispatchDateTechnician,
          )
        : null,
      [dateService.validateDate(dateService)],
    ],
    createdAt: [
      {
        value: anonymData.createdAt
          ? dateService.getValidDateStringFormatFromDate(anonymData.createdAt)
          : null,
        disabled: true,
      },
    ],
    assignedTo: [
      {
        value: anonymData.assignedTo ? anonymData.assignedTo.uid : null,
        disabled: user.isTechnician,
      },
    ],
    customerName: [anonymData.customerName, [Validators.required]],
    customerPhone: [
      anonymData.customerPhone,
      [
        Validators.required,
        Validators.pattern('^[9]{1}[0-9]{2}[ ]{0,1}[0-9]{3}[ ]{0,1}[0-9]{3}$'),
      ],
    ],
    sp: [
      {
        value: anonymData.sp || null,
        disabled: user.isTechnician,
      },
    ],
    note: [anonymData.note || null],
  });

  if (anonymData.hsDispatchDate) {
    form.disable();
  }

  return form;
}
