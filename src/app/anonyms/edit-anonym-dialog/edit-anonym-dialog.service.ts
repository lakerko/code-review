import { Inject, Injectable } from '@angular/core';
import { HelperService } from '../../shared/services/helper.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DateService } from '../../shared/services/date.service';
import { map, takeUntil } from 'rxjs/operators';
import { EmployeeInfo } from '../../shared/shared.model';
import { DataService } from '../../shared/data/data.service';
import { DestroyService } from './edit-anonym-dialog.providers';

const PROPERTIES = [
  'technicalStuff2',
  'type',
  'otherTechnicalStuff',
  'technicalStuff',
  'typeAnonym',
  'otherTechnicalStuffAnonym',
  'correspondingtechnicalStuff',
  'correspondingtechnicalStuffType',
  'correspondingtechnicalStuffotherTechnicalStuff',
  'correspondingtechnicalStuffAnonym',
  'correspondingtechnicalStuffAnonymType',
  'correspondingtechnicalStuffAnonymotherTechnicalStuff',
  'assignedTo',
  'customerName',
  'customerPhone',
  'note',
  'hsDispatchDate',
  'hsDispatchDateTechnician',
  'sp',
];

@Injectable()
export class EditAnonymDialogService {
  private displayTechnicians: EmployeeInfo[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) private readonly data: any,
    private readonly destroy$: DestroyService,
    private readonly helper: HelperService,
    private readonly dateService: DateService,
    private readonly dataService: DataService,
  ) {
    // This might be a prerequisite for your dialog,
    // otherwise there's a chance you trigger related checks before you have the array
    this.getTechnicians();
  }

  // Type your Payload model
  getPayload(rawData: any): any | null {
    const transformedForm = this.transformFormDataToRequestData(rawData);
    const originWithDates = this.transfromtDatesToDateObjects(
      this.getParsableData(this.data.anonymData),
    );
    const changesObj = this.helper.getChangesObject(
      originWithDates,
      transformedForm,
      PROPERTIES,
    );
    const changes = this.helper.getKeyValuePairsFromChanges(changesObj);

    changes.dispatched =
      changesObj &&
      changesObj.hsDispatchDate &&
      changesObj.hsDispatchDate.newValue &&
      !changesObj.hsDispatchDate.oldValue;

    changes.dispatchedByTechnician =
      changesObj &&
      changesObj.hsDispatchDateTechnician &&
      changesObj.hsDispatchDateTechnician.newValue &&
      !changesObj.hsDispatchDateTechnician.oldValue;

    if (
      this.data.anonymData.hsDispatchDate &&
      changesObj.hsDispatchDate &&
      !changesObj.hsDispatchDate.newValue
    ) {
      changes.hsDispatchDate = null;
    }

    if (
      this.data.anonymData.hsDispatchDateTechnician &&
      changesObj.hsDispatchDateTechnician &&
      !changesObj.hsDispatchDateTechnician.newValue
    ) {
      changes.hsDispatchDateTechnician = null;
    }

    const payload: any = {
      anonym: changes,
      anonymId: this.data.anonymData.id,
      technicalStuffData: null,
    };

    if (!changesObj || !changes) {
      return null;
    }

    if (changes.technicalStuff2) {
      payload.technicalStuffInventory = {
        technicalStuff: changes.technicalStuff2,
        type: changes.type || transformedForm.type,
        otherTechnicalStuff:
          changes.otherTechnicalStuff || transformedForm.otherTechnicalStuff,
      };
    }

    if (changes.technicalStuff) {
      payload.technicalStuffAnonym = {
        technicalStuff: changes.technicalStuff,
        type: changes.typeAnonym || transformedForm.typeAnonym,
        otherTechnicalStuff:
          changes.otherTechnicalStuffAnonym ||
          transformedForm.otherTechnicalStuffAnonym,
      };
    }

    if (changes.correspondingtechnicalStuff) {
      payload.correspondingtechnicalStuff = {
        technicalStuff: changes.correspondingtechnicalStuff,
        type:
          changes.correspondingtechnicalStuffType ||
          transformedForm.correspondingtechnicalStuffType,
        otherTechnicalStuff:
          changes.correspondingtechnicalStuffotherTechnicalStuff ||
          transformedForm.correspondingtechnicalStuffotherTechnicalStuff,
      };
    }

    if (changes.correspondingtechnicalStuffAnonym) {
      payload.correspondingtechnicalStuffAnonym = {
        technicalStuff: changes.correspondingtechnicalStuffAnonym,
        type:
          changes.correspondingtechnicalStuffAnonymType ||
          transformedForm.correspondingtechnicalStuffAnonymType,
        otherTechnicalStuff:
          changes.correspondingtechnicalStuffAnonymotherTechnicalStuff ||
          transformedForm.correspondingtechnicalStuffAnonymotherTechnicalStuff,
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

    return payload;
  }

  private transformFormDataToRequestData(data) {
    const transformed: any = {};

    if (
      data.technicalStuffPresent &&
      data.technicalStuffPresent.technicalStuff
    ) {
      transformed.technicalStuff2 = data.technicalStuffPresent.technicalStuff;
      transformed.type = data.technicalStuffPresent.type;
      transformed.otherTechnicalStuff =
        data.technicalStuffPresent.otherTechnicalStuff;
    }

    if (data.technicalStuffAnonym && data.technicalStuffAnonym.technicalStuff) {
      transformed.technicalStuff = data.technicalStuffAnonym.technicalStuff;
      transformed.typeAnonym = data.technicalStuffAnonym.type;
      transformed.otherTechnicalStuffAnonym =
        data.technicalStuffAnonym.otherTechnicalStuff;
    }

    if (
      data.technicalStuffCorresponding &&
      data.technicalStuffCorresponding.technicalStuff
    ) {
      transformed.correspondingtechnicalStuff =
        data.technicalStuffCorresponding.technicalStuff;
      transformed.correspondingtechnicalStuffType =
        data.technicalStuffCorresponding.type;
      transformed.correspondingtechnicalStuffotherTechnicalStuff =
        data.technicalStuffCorresponding.otherTechnicalStuff;
      // this.correspondingtechnicalStuffTags = [];
    } else if (this.data.anonymData.correspondingtechnicalStuff) {
      transformed.correspondingtechnicalStuff = null;
      transformed.correspondingtechnicalStuffType = null;
      transformed.correspondingtechnicalStuffotherTechnicalStuff = null;
    }

    if (
      data.technicalStuffAnonymCorresponding &&
      data.technicalStuffAnonymCorresponding.technicalStuff
    ) {
      transformed.correspondingtechnicalStuffAnonym =
        data.technicalStuffAnonymCorresponding.technicalStuff;
      transformed.correspondingtechnicalStuffAnonymType =
        data.technicalStuffAnonymCorresponding.type;
      transformed.correspondingtechnicalStuffAnonymotherTechnicalStuff =
        data.technicalStuffAnonymCorresponding.otherTechnicalStuff;
      // this.correspondingtechnicalStuffTags = [];
    } else if (this.data.anonymData.correspondingtechnicalStuffAnonym) {
      transformed.correspondingtechnicalStuffAnonym = null;
      transformed.correspondingtechnicalStuffAnonymType = null;
      transformed.correspondingtechnicalStuffAnonymotherTechnicalStuff = null;
    }

    if (data.hsDispatchDate) {
      transformed.hsDispatchDate = this.dateService.getValidDateObjectFromString(
        data.hsDispatchDate,
      );
    }

    if (data.hsDispatchDateTechnician) {
      transformed.hsDispatchDateTechnician = this.dateService.getValidDateObjectFromString(
        data.hsDispatchDateTechnician,
      );
    }

    if (data.assignedTo) {
      const assignedTechnician = this.displayTechnicians.find(
        (technician) => technician.uid === data.assignedTo,
      );
      transformed.assignedTo = this.helper.getEmployeeInfo(assignedTechnician);
    }

    transformed.customerName = data.customerName;
    transformed.customerPhone = data.customerPhone;
    transformed.note = data.note;
    transformed.sp = data.sp;

    return transformed;
  }

  private transfromtDatesToDateObjects(data) {
    const result = JSON.parse(JSON.stringify(data));

    if (result.hsDispatchDate) {
      result.hsDispatchDate = this.dateService.getValidDateObjectFromString(
        this.dateService.getValidDateStringFormatFromDate(
          result.hsDispatchDate,
        ),
      );
    }

    return result;
  }

  private getTechnicians() {
    this.dataService
      .getTechnicians()
      .pipe(
        takeUntil(this.destroy$),
        map((technicians) =>
          this.helper.getTechniciansWithEmptyOption(technicians),
        ),
      )
      .subscribe((technicians) => {
        this.displayTechnicians = this.helper.getTechniciansWithUnofficial(
          this.data.anonymData.assignedTo,
          technicians,
        );
      });
  }

  private getParsableData(data) {
    const result = {};

    for (const key of Object.keys(data)) {
      if (key !== 'technicalStuffRef' && key !== 'relationships') {
        result[key] = data[key];
      }
    }

    return result;
  }
}
