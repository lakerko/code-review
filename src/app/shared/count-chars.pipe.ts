import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'countChars'
})
export class CountCharsPipe implements PipeTransform {

  transform(value: string, ...args: unknown[]): number {
    return value ? value.replace(/ +/g, '').length : 0;
  }

}
