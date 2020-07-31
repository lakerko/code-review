import { Injectable } from '@angular/core';

import { Sort } from '@angular/material/sort';

import { ClipboardService } from 'ngx-clipboard';

import { DialogService } from './dialog.service';
import { SelectedData } from './selected-data.service';
import { DateService } from './date.service';
import { otherTechnicalStuffsService } from './otherTechnicalStuffs.service';

import { ChangesProperty, User, EmployeeInfo, ChangesObj, History } from '../shared.model';
import { Anonym } from 'src/app/anonyms/anonym.model';
import { Dontwant } from 'src/app/dontwants/dontwant.model';
import { technicalStuff } from 'src/app/presents/present.model';

@Injectable({
  providedIn: 'root'
})
export class HelperService {
  private dateColumns = [ 'dateAdded', 'createdAt', 'hsDispatchDate' ];

  constructor(
    private clipboardService: ClipboardService,
    private dialogService: DialogService,
    private dateService: DateService,
    private otherTechnicalStuffsService: otherTechnicalStuffsService,
  ) { }

  getChangesObject(originalData = {}, currentData = {}, compareProperties: string[] = []): ChangesObj {
    let changes: ChangesObj = null;

    compareProperties.forEach((property: string) => {
      if (this.isValueChanged(originalData[property], currentData[property])) {
        if (!changes) {
          changes = {};
        }
        changes[property] = this.fillChangesKey(originalData[property], currentData[property]);
      }
    });

    return changes;
  }

  isValueChanged(originalProp, currentProp): boolean {
    const isOriginalUnset = this.isValueUnset(originalProp);
    const isCurrentUnset = this.isValueUnset(currentProp);
    if (isOriginalUnset && isCurrentUnset) {
      return false;
    }

    if (originalProp instanceof Date || currentProp instanceof Date) {
      return this.dateService.getValidDateStringFormat(originalProp) !== this.dateService.getValidDateStringFormat(currentProp);
    }

    const isOriginalObject = this.isObject(originalProp);
    const isCurrentObject = this.isObject(currentProp);

    if (isOriginalObject && isCurrentObject) {
      return this.areObjectUidsChanged(originalProp, currentProp);
    } else if (isOriginalObject || isCurrentObject) {
      return true;
    }


    return originalProp !== currentProp;
  }

  areObjectUidsChanged(originalProp, currentProp) {
    return originalProp.uid !== currentProp.uid;
  }

  isValueChangedInObject(originalProp, currentProp): boolean {
    return (
      !this.isObject(originalProp) ||
      (
        originalProp.uid && !currentProp ||
        (originalProp.uid && originalProp.uid !== currentProp.uid)
      )
    );
  }

  isValueUnset(value): boolean {
    return value === undefined || value === null || value === '';
  }

  fillChangesKey(original, current): ChangesProperty {
    return {
      oldValue: this.sanitizeValueForFirebase(original),
      newValue: this.sanitizeValueForFirebase(current),
    };
  }

  isObject(value: any): boolean {
    return typeof value === 'object' && value !== null;
  }

  getHistoryObj(changedValues: ChangesObj, user: User): History {
    return {
      changedValues,
      changedProperties: changedValues ? Object.keys(changedValues) : [],
      updatedBy: this.getEmployeeInfo(user),
    };
  }

  getEmployeeInfo(employee: EmployeeInfo | User): EmployeeInfo {
    return employee && employee.uid ? {
      uid: employee.uid,
      displayName: employee.displayName,
    } : null;
  }

  getKeyValuePairsFromChanges(changedValues: ChangesObj): { [key: string]: any} {
    if (!changedValues) {
      return;
    }
    const pairs = {};
    for (const key of Object.keys(changedValues)) {
      pairs[key] = changedValues[key].newValue;
    }
    return pairs;
  }

  getUnofficialTechnician(assignedTo: EmployeeInfo, technicians: EmployeeInfo[]): EmployeeInfo {
    if (assignedTo) {
      const isTechnicianLegit = technicians.filter(technician => technician.uid === assignedTo.uid);
      if (!isTechnicianLegit.length) {
        return assignedTo;
      }
    }
  }

  getTechniciansWithUnofficial(assignedTo: EmployeeInfo, technicians: EmployeeInfo[]) {
    const unofficialTechnician = this.getUnofficialTechnician(assignedTo, technicians);
    if (unofficialTechnician) {
      return [ ...technicians, unofficialTechnician];
    }
    return [ ...technicians ];
  }

  getTechniciansWithEmptyOption(technicians: EmployeeInfo[], emptyLabel = 'Nepridelený') {
    return [
      { uid: null, displayName: emptyLabel },
      ...technicians,
    ];
  }

  sortTableData<T>(data: T[], sort: Sort): T[] {
    return data.sort((a: any, b: any) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'dateAdded': return this.compare(
          a.dateAdded ? a.dateAdded.seconds : 0,
          b.dateAdded ? b.dateAdded.seconds : 0,
          isAsc
        );
        case 'createdAt': return this.compare(
          a.createdAt ? a.createdAt.seconds : 0,
          b.createdAt ? b.createdAt.seconds : 0,
          isAsc
        );
        case 'hsDispatchDate': return this.compare(
          a.hsDispatchDate ? a.hsDispatchDate.seconds : 0,
          b.hsDispatchDate ? b.hsDispatchDate.seconds : 0,
          isAsc
        );
        case 'assignedTo':
          const firstAssigned = a.assignedTo && a.assignedTo.displayName ? a.assignedTo.displayName.toLowerCase() : '';
          const secondAssigned = b.assignedTo && b.assignedTo.displayName ? b.assignedTo.displayName.toLowerCase() : '';
          return firstAssigned.localeCompare(secondAssigned, 'sk') * (isAsc ? 1 : -1);
        case 'type':
          const firstType = this.sanitizeStringAndLowerCase(a.type);
          const secondType = this.sanitizeStringAndLowerCase(b.type);
          return firstType.localeCompare(secondType, 'sk', {sensitivity: 'base'}) * (isAsc ? 1 : -1);
        case 'typeAnonym':
          const firstTypeAnonym = this.sanitizeStringAndLowerCase(a.typeAnonym);
          const secondTypeAnonym = this.sanitizeStringAndLowerCase(b.typeAnonym);
          return firstTypeAnonym.localeCompare(secondTypeAnonym, 'sk', {sensitivity: 'base'}) * (isAsc ? 1 : -1);
        case 'customerName':
          const firstCustomerName = this.sanitizeStringAndLowerCase(a.customerName);
          const secondCustomerName = this.sanitizeStringAndLowerCase(b.customerName);
          return firstCustomerName.localeCompare(secondCustomerName, 'sk', {sensitivity: 'base'}) * (isAsc ? 1 : -1);
        default: return 0;
      }
    });
  }

  isDateColumn(column: string): boolean {
    return this.dateColumns.includes(column);
  }

  private compare(a: string | number, b: string | number, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  copyToClipboardFromGlobalData(data: SelectedData) {
    let displayInEmail = '';
    data.anonyms.all.forEach((anonym: Anonym) => {
      displayInEmail += this.createAnonymEmailString(anonym);
      displayInEmail += '\n';
    });

    data.dontwants.all.forEach((dontwant: Dontwant) => {
      displayInEmail += this.createEmailString(dontwant);
      displayInEmail += '\n';
    });

    data.presents.all.forEach((technicalStuff: technicalStuff) => {
      displayInEmail += this.createEmailString(technicalStuff);
      displayInEmail += '\n';
    });

    this.clipboardService.copyFromContent(displayInEmail);
    this.dialogService.openSnackBar(`Uložené do clipboardu. Použite CTRL+V v emaili.`);
  }

  copyToClipboard(data, isAnonym: boolean = false) {
    this.clipboardService.copyFromContent(isAnonym ? this.createAnonymEmailString(data) : this.createEmailString(data));
    this.dialogService.openSnackBar(`Uložené do clipboardu. Použite CTRL+V v emaili.`);
  }

  createEmailString(data): string {
    let emailString = '';
    if (data.note) {
      emailString += data.note.toString() + '\n';
    }

    if (data.technicalStuff) {
      emailString += data.technicalStuff.toString() + ' - ' +  this.sanitizeString(data.otherTechnicalStuff) + '\n';
    }

    if (data.correspondingtechnicalStuff) {
      emailString += data.correspondingtechnicalStuff.toString() + ' - ' +  this.sanitizeString(data.correspondingotherTechnicalStuff) + '\n';
    }

    if (data.technicalStuffAnonym) {
      emailString += data.technicalStuffAnonym.toString() + ' - ' +  this.sanitizeString(data.otherTechnicalStuffAnonym) + '\n';
    }

    if (data.correspondingAnonymtechnicalStuff) {
      emailString += data.correspondingAnonymtechnicalStuff.toString() + ' - ' +  this.sanitizeString(data.correspondingAnonymotherTechnicalStuff) + '\n';
    }

    return emailString;
  }

  createAnonymEmailString(data): string {
    let emailString = '';
    if (data.note) {
      emailString += data.note.toString() + '\n';
    }

    if (data.technicalStuff) {
      emailString += data.technicalStuff.toString() + ' - ' +  this.sanitizeString(data.otherTechnicalStuffAnonym) + '\n';
    }

    if (data.correspondingAnonymtechnicalStuff) {
      emailString += data.correspondingAnonymtechnicalStuff.toString() + ' - ' +  this.sanitizeString(data.correspondingAnonymotherTechnicalStuff) + '\n';
    }

    if (data.technicalStuff2) {
      emailString += data.technicalStuff2.toString() + ' - ' +  this.sanitizeString(data.otherTechnicalStuff) + '\n';
    }

    if (data.correspondingtechnicalStuff) {
      emailString += data.correspondingtechnicalStuff.toString() + ' - ' +  this.sanitizeString(data.correspondingotherTechnicalStuff) + '\n';
    }

    return emailString;
  }

  sanitizeString(value: string): string {
    return (value ? value : '');
  }

  sanitizeStringAndLowerCase(value: string): string {
    return (value ? value : '').toLowerCase();
  }

  /**
   *
   * Firebase doesn't accept undefined as a value
   */
  sanitizeValueForFirebase(value: any): any {
    return value !== undefined ? value : null;
  }

  // Name of the type can change in time, otherTechnicalStuff cannot.
  fixTypesBasedOnotherTechnicalStuffs(data: any[]): any[] {
    return data.map(item => {
      if (item.type && item.otherTechnicalStuff) {
        item.type = this.otherTechnicalStuffsService.getTypeFromotherTechnicalStuff(item.otherTechnicalStuff);
      }
      if (item.typeAnonym && item.otherTechnicalStuffAnonym) {
        item.typeAnonym = this.otherTechnicalStuffsService.getTypeFromotherTechnicalStuff(item.otherTechnicalStuffAnonym);
      }
      return item;
    });
  }

  getColumnsFromDefinitions(obj): { value: string, hide: () => boolean }[] {
    const arr = [];
    for (const key of Object.keys(obj)) {
      arr.push({ value: key, hide: obj[key].hide });
    }
    return arr;
  }

  // TODO: technicalStuffDuplicates and incrementBy are there just because of missing + actions for adding multiple technicalStuffs.
  // Once that will work I can remove this logic
  // for multiple rows with the same technicalStuff in Anonyms
  fixValues(data, targetType = 'type') {
    const technicalStuffDuplicates = [];
    return data
      .reduce((accumulator, currentValue) => {
        // Anonyms tend to havve multiple rows with the same technicalStuff, they should be counted as one
        let incrementBy = 1;
        if (targetType === 'typeAnonym') {
          if (technicalStuffDuplicates.includes(currentValue.technicalStuff)) {
            return accumulator;
          } else {
            technicalStuffDuplicates.push(currentValue.technicalStuff);
          }
        } else {
          // Dontwants tend to have technicalStuffs separated by '/' (slash) and every technicalStuff represents another row. I should count them as multiple rows
          const technicalStuffSeparatorCount = (currentValue.technicalStuff.match(/\//g) || []).length;
          if (technicalStuffSeparatorCount) {
            incrementBy = technicalStuffSeparatorCount + 1;
          }
        }
        if (accumulator[currentValue[targetType]]) {
          accumulator[currentValue[targetType]] = accumulator[currentValue[targetType]] + incrementBy;
        } else if (currentValue[targetType]) {
          accumulator[currentValue[targetType]] = incrementBy;
        }
        return accumulator;
      }, {} as { [key: string]: number });
  }
}
