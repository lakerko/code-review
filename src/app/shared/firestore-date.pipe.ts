import { PipeTransform, Pipe } from '@angular/core';
import { DateService } from './services/date.service';

@Pipe({name: 'firestoredate'})
export class FirestoreDatePipe implements PipeTransform {

  constructor(private dateService: DateService) {}

  transform(value, args?: string[]): any {
    return this.dateService.getValidDateStringFormat(value);
  }
}
