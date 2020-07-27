import { Injectable } from '@angular/core';
import { ValidatorFn, AbstractControl } from '@angular/forms';
import { FirebaseDate } from '../shared.model';

@Injectable({
  providedIn: 'root'
})
export class DateService {

  constructor() { }

  validateDate(dateService: DateService): ValidatorFn {
    return (control: AbstractControl) => {
      if (!control || !control.value) {
        return null;
      }
      const value = typeof control.value === 'string' || control.value === null ? control.value : control.value.value;
      if (!value) {
        return null;
      }
      const dateWithLeadingZeros = this.getValidDateFormatFromString(value);

      const testDate = this.getValidDateObjectFromString(dateWithLeadingZeros);
      const testDay = testDate.getDate().toString().padStart(2, '0');
      const testMonth = (testDate.getMonth() + 1).toString().padStart(2, '0');
      const testDateString = `${testDay}.${testMonth}.${testDate.getFullYear()}`;

      const dateRegexp =  RegExp('^\\d{1,2}.\\d{1,2}.\\d{4}$');

      return (dateRegexp.test(value) && dateWithLeadingZeros === testDateString) ? null : {
        validateDate: {
          valid: false
        }
      };
    };
  }

  getValidDateFormatFromString(dateString: string): string {
    const daySeparatorIndex = dateString.indexOf('.');
    const monthSeparatorIndex = dateString.indexOf('.', (daySeparatorIndex + 1));
    const inputDay = dateString.substring(0, daySeparatorIndex);
    const inputMonth = dateString.substring(daySeparatorIndex + 1, monthSeparatorIndex);
    const inputYear = dateString.substring(monthSeparatorIndex + 1);

    return `${inputDay.padStart(2, '0')}.${inputMonth.padStart(2, '0')}.${inputYear}`;
  }

  getPartialValidDateFormatFromString(dateString: string): string {
    const daySeparatorIndex = dateString.indexOf('.');
    const monthSeparatorIndex = dateString.indexOf('.', (daySeparatorIndex + 1));

    const inputYear = monthSeparatorIndex !== -1 ? dateString.substring(monthSeparatorIndex + 1) : undefined;

    let partial = '';
    if (daySeparatorIndex !== -1) {
      const inputDay = dateString.substring(0, daySeparatorIndex);
      partial = `${inputDay.padStart(2, '0')}.`;
    } else {
      return dateString;
    }

    if (monthSeparatorIndex !== -1) {
      const inputMonth = dateString.substring(daySeparatorIndex + 1, monthSeparatorIndex);
      partial += `${inputMonth.padStart(2, '0')}.`;
    }

    if (inputYear !== undefined) {
      partial += inputYear;
    }
    return partial;
  }

  getValidDateObjectFromString(dateString: string): Date {
    const daySeparatorIndex = dateString.indexOf('.');
    const monthSeparatorIndex = dateString.indexOf('.', (daySeparatorIndex + 1));
    const inputDay = parseInt(dateString.substring(0, daySeparatorIndex), 10);
    const inputMonth = parseInt(dateString.substring(daySeparatorIndex + 1, monthSeparatorIndex), 10);
    const inputYear = parseInt(dateString.substring(monthSeparatorIndex + 1), 10);

    return new Date(inputYear, inputMonth - 1, inputDay);
  }

  getValidDateStringFormatFromDate(date: Date | FirebaseDate): string {
    const dateValue = date instanceof Date ? date : new Date(date.seconds * 1000);
    const day = dateValue.getDate().toString().padStart(2, '0');
    const month = (dateValue.getMonth() + 1).toString().padStart(2, '0');

    return `${day}.${month}.${dateValue.getFullYear()}`;
  }

  getValidDateStringFormat(date: Date | FirebaseDate | string): string {
    if (!date) {
      return '';
    } else if (date instanceof Date) {
      return this.getValidDateStringFormatFromDate(date);
    } else if (date && (date as FirebaseDate).seconds) {
      return this.getValidDateStringFormatFromDate(date as FirebaseDate);
    } else if (typeof date === 'string') {
      return this.getValidDateFormatFromString(date);
    }
  }

  getCurrentDateAsString(): string {
    const today = new Date();
    const dayWithLeadingZero = today.getDate().toString().padStart(2, '0');
    const monthWithLeadingZero = (today.getMonth() + 1).toString().padStart(2, '0');
    return `${dayWithLeadingZero}.${monthWithLeadingZero}.${today.getFullYear()}`;
  }

  getCurrentDateAsDate(): Date {
    return this.getValidDateObjectFromString(this.getCurrentDateAsString());
  }
}
