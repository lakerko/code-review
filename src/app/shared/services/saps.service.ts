import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { otherTechnicalStuffDefMap, otherTechnicalStuffDef, SelectOption } from '../shared.model';
import { DataService } from '../data/data.service';

@Injectable({
  providedIn: 'root'
})
export class otherTechnicalStuffsService {
  private technicalStuffsWithotherTechnicalStuffArrays: { [ key: string]: string[] } = {};
  private types: string[] = [];
  public otherTechnicalStuffDefs: otherTechnicalStuffDefMap = {};
  public otherTechnicalStuffs$: BehaviorSubject<otherTechnicalStuffDef[]> = new BehaviorSubject([]);

  constructor(
    private dataService: DataService,
  ) {
    this.dataService.otherTechnicalStuffs$.subscribe((otherTechnicalStuffs: otherTechnicalStuffDef[]) => {
      this.otherTechnicalStuffDefs = this.transfromotherTechnicalStuffArrayToMap(otherTechnicalStuffs);
      this.technicalStuffsWithotherTechnicalStuffArrays = this.gettechnicalStuffsWithotherTechnicalStuffArrays(this.otherTechnicalStuffDefs);
      this.types = otherTechnicalStuffs.map(otherTechnicalStuff => otherTechnicalStuff.type);
      this.otherTechnicalStuffs$.next(otherTechnicalStuffs);
    });
  }

  transfromotherTechnicalStuffArrayToMap(otherTechnicalStuffDefs: otherTechnicalStuffDef[]): otherTechnicalStuffDefMap {
    const otherTechnicalStuffDefMap = {};
    otherTechnicalStuffDefs.forEach(otherTechnicalStuffDef => {
      otherTechnicalStuffDefMap[otherTechnicalStuffDef.otherTechnicalStuff] = otherTechnicalStuffDef;
    });
    return otherTechnicalStuffDefMap;
  }

  gettechnicalStuffsWithotherTechnicalStuffArrays(otherTechnicalStuffDefs: otherTechnicalStuffDefMap) {
    const technicalStuffotherTechnicalStuffMap = {};
    for (const otherTechnicalStuff of Object.keys(otherTechnicalStuffDefs)) {
      const technicalStuffs: string[] = otherTechnicalStuffDefs[otherTechnicalStuff].technicalStuffs;
      technicalStuffs.forEach(technicalStuff => {
        if (!technicalStuffotherTechnicalStuffMap[technicalStuff]) {
          technicalStuffotherTechnicalStuffMap[technicalStuff] = [ otherTechnicalStuff ];
        } else if (technicalStuffotherTechnicalStuffMap[technicalStuff] && !(technicalStuffotherTechnicalStuffMap[technicalStuff] as string[]).includes(otherTechnicalStuff)) {
          technicalStuffotherTechnicalStuffMap[technicalStuff].push(otherTechnicalStuff);
        }
      });
    }
    return technicalStuffotherTechnicalStuffMap;
  }

  gettechnicalStuffs(): string[] {
    return Object.keys(this.technicalStuffsWithotherTechnicalStuffArrays).sort();
  }

  getotherTechnicalStuffs(): string[] {
    return Object.keys(this.otherTechnicalStuffDefs).sort();
  }

  getotherTechnicalStuffsAsOptions(otherTechnicalStuffs: string[] = this.getotherTechnicalStuffs()): SelectOption[] {
    return otherTechnicalStuffs.map((otherTechnicalStuff: string) => {
      return {
        value: otherTechnicalStuff,
        displayName: this.getotherTechnicalStuffLabel(otherTechnicalStuff),
      };
    }).sort((a, b) =>
      a.displayName.split('-').pop().localeCompare(b.displayName.split('-').pop(), 'sk')
    );
  }

  getTypes(): string[] {
    return this.types.sort();
  }

  gettechnicalStuffsAndotherTechnicalStuffs(): { [key: string]: string[] } {
    return this.technicalStuffsWithotherTechnicalStuffArrays;
  }

  getTypeFromotherTechnicalStuff(otherTechnicalStuff: string): string {
    return this.otherTechnicalStuffDefs[otherTechnicalStuff] ? this.otherTechnicalStuffDefs[otherTechnicalStuff].type : '';
  }

  getotherTechnicalStuffLabel(otherTechnicalStuff: string): string {
    return this.otherTechnicalStuffDefs[otherTechnicalStuff] ? this.otherTechnicalStuffDefs[otherTechnicalStuff].label : otherTechnicalStuff;
  }

  getTypesFromotherTechnicalStuffs(otherTechnicalStuffs: SelectOption[]): string[] {
    return otherTechnicalStuffs.reduce((accumulator: string[], currentValue: SelectOption) => {
      const type = this.getTypeFromotherTechnicalStuff(currentValue.value);
      if (!accumulator.includes(type)) {
        accumulator.push(type);
      }
      return accumulator;
    }, []);
  }

}
