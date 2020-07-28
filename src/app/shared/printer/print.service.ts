import { Injectable } from '@angular/core';

import { DateService } from '../services/date.service';
import { SelectedDataService, SelectedData, SelectedMode } from '../services/selected-data.service';
import { HelperService } from '../services/helper.service';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class PrintService {
  private anonymsPrintable = [];
  private dontwantsPrintable = [];
  private presentsPrintable = [];

  private countedAnonyms = {};
  private countedDontwants = {};
  private countedPresents = {};
  private displayCounted = '';

  private anonymDontwantColumns = {
    technicalStuff: 'technicalStuff od zákazníka',
    type: 'Typ od zákazníka',
    technicalStuff2: 'technicalStuff zo Presentu',
    customerName: 'Meno zákazníka',
    customerPhone: 'Tel. č. služby',
    sp: 'Servisná požiadavka',
    note: 'Poznámka',
    hsDispatchDate: 'Dátum odoslania na HS',
  };

  private presentColumns = {
    technicalStuff: 'technicalStuff zo Presentu',
    type: 'Typ zo Presentu',
    note: 'Poznámka',
  };

  private reclamationColumns = {
    dateAdded: 'Dátum pridania',
    technicalStuff: 'technicalStuff zo Presentu',
    type: 'Typ zo Presentu',
    assignedTo: 'Technik',
    note: 'Popis závady',
  };

  private printDefinition = {
    printable: [],
    properties: this.createPrintDefinition(this.anonymDontwantColumns),
    type: 'json',
    header: this.createHeader(),
    style: `
      td {
        padding: 0.5em;
      }

      .counted span {
        display: inline-block;
        margin-right: 0.5em;
        padding: 0.25em;
      }
    `
  };

  constructor(
    private dateService: DateService,
    private selectedDataService: SelectedDataService,
    private helper: HelperService,
    private userService: UserService,
  ) {
    this.selectedDataService.selectedChanges$.subscribe((data: SelectedData) => {
      this.setPrintableAnonyms(data.anonyms.all);
      this.setPrintableDontwants(data.dontwants.all);
      this.setPrintablePresents(data.presents.all);
      this.printDefinition.properties = this.createPrintDefinition(this.getColumnDefinition(data.mode), data.mode);
      this.printDefinition.header = this.createHeader();
    });
  }

  createHeader(): string {
    const countedTypes = this.sumAll([
      this.countedAnonyms,
      this.countedDontwants,
      this.countedPresents,
    ]);

    this.displayCounted = this.createDisplayCountedString(countedTypes);

    const user = this.userService.getUser();

    return `<div>
      <p>vystavil: ${ user && user.login ? user.login : '' }</p>
      <p class="counted">${this.displayCounted}</p>
    </div>`;
  }

  sumAll(arrOfCategories) {
    const sumAll = {};

    arrOfCategories.forEach(category => {
      for (const key of Object.keys(category)) {
        if (sumAll[key]) {
          sumAll[key] += category[key];
        } else {
          sumAll[key] = category[key];
        }
      }
    });
    return sumAll;
  }

  createDisplayCountedString(countedProperties: { [key: string]: string }): string {
    let finalString = '';
    const sortedTypes = Object.keys(countedProperties).sort();
    sortedTypes.forEach(type => {
      finalString += `<span>${type}: ${countedProperties[type]}</span>`;
    });
    return finalString;
  }

  createPrintDefinition(definitionColumns: { [key: string]: string}, mode?: SelectedMode): { [key: string]: string}[] {
    const definition = [];
    const shouldSkipDispatchDate = mode === 'anonym_dontwant' && !this.printDefinition.printable.filter(item => item.hsDispatchDate).length;

    for (const key of Object.keys(definitionColumns)) {
      if (key === 'hsDispatchDate' && shouldSkipDispatchDate) {
        continue;
      }

      definition.push({
        field: key,
        displayName: definitionColumns[key],
      });
    }

    return definition;
  }

  getColumnDefinition(mode: SelectedMode) {
    switch (mode) {
      case 'anonym_dontwant':
        return this.anonymDontwantColumns;
      case 'present':
        return this.presentColumns;
      case 'reclamation':
        return this.reclamationColumns;
      default:
        return {};
    }
  }

  setPrintableAnonyms(anonyms) {
    this.countedAnonyms = this.helper.fixValues(anonyms, 'typeAnonym');
    this.anonymsPrintable = this.transformData(anonyms, 'anonyms');
    this.printDefinition.printable = [
      ...this.anonymsPrintable,
      ...this.dontwantsPrintable,
      ...this.presentsPrintable,
    ];
  }

  setPrintableDontwants(dontwants) {
    this.countedDontwants = this.helper.fixValues(dontwants, 'type');
    this.dontwantsPrintable = this.transformData(dontwants, 'dontwants');
    this.printDefinition.printable = [
      ...this.anonymsPrintable,
      ...this.dontwantsPrintable,
      ...this.presentsPrintable,
    ];
  }

  setPrintablePresents(presents) {
    this.countedPresents = this.helper.fixValues(presents, 'type');
    this.presentsPrintable = this.transformData(presents, 'presents');
    this.printDefinition.printable = [
      ...this.anonymsPrintable,
      ...this.dontwantsPrintable,
      ...this.presentsPrintable,
    ];
  }

  getPrintDefinition(): any {
    return this.printDefinition;
  }

  transformData(data, target?: string) {
    return data.map(item => this.sanitizePrintObject(item, target));
  }

  sanitizePrintObject(obj, target?: string) {
    const sanitizedObj: any = {
      printCategory: target,
    };
    for (const key of Object.keys(this.anonymDontwantColumns)) {
      sanitizedObj[key] = obj.hasOwnProperty(key) ? this.sanitizeProperty(key, obj[key]) : '';
    }
    if (target === 'dontwants') {
      sanitizedObj.technicalStuff2 = '*DontwantIE*';
    }
    if (target === 'anonyms') {
      sanitizedObj.type = obj.typeAnonym;
    }
    return sanitizedObj;
  }

  sanitizeProperty(key: string, prop: any): string {
    switch (key) {
      case 'assignedTo':
        return prop && prop.displayName ? prop.displayName : '';
      case 'hsDispatchDate':
        return prop ? this.dateService.getValidDateStringFormatFromDate(prop) : '';
      default:
        return prop ? prop : '';
    }
  }

}
