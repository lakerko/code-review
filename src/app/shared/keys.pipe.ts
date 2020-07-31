import { PipeTransform, Pipe } from '@angular/core';

@Pipe({name: 'keys'})
export class KeysPipe implements PipeTransform {

  transform(value): any {
    const keys = [];
    for (const key of Object.keys(value)) {
      keys.push({
        key,
        value: value[key],
      });
    }
    return keys;
  }
}
