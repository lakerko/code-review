import { Injectable } from '@angular/core';

import { Subject } from 'rxjs';

import { Anonym } from 'src/app/anonyms/anonym.model';
import { Dontwant } from 'src/app/dontwants/dontwant.model';
import { technicalStuff } from 'src/app/presents/present.model';

export interface SelectedData {
  anonyms: {
    opened: Anonym[];
    inventory: Anonym[];
    all: Anonym[];
  };
  dontwants: {
    opened: Dontwant[];
    inventory: Dontwant[];
    all: Dontwant[];
  };
  presents: {
    all: technicalStuff[];
  };
  reclamations: {
    all: any[];
  };
  length: number;
  mode: SelectedMode;
}

export type SelectedMode = 'anonym_dontwant' | 'present' | 'reclamation' | '';

@Injectable({
  providedIn: 'root'
})
export class SelectedDataService {
  private selectedData: SelectedData = this.getInitialValue();
  public selectedChanges$: Subject<SelectedData> = new Subject();
  public clearSelected$: Subject<boolean> = new Subject();

  constructor() { }

  getInitialValue(): SelectedData {
    return {
      anonyms: {
        opened: [],
        inventory: [],
        all: [],
      },
      dontwants: {
        opened: [],
        inventory: [],
        all: [],
      },
      presents: {
        all: [],
      },
      reclamations: {
        all: [],
      },
      length: 0,
      mode: '',
    };
  }

  clearSelection(): void {
    this.selectedData = this.getInitialValue();
    this.selectedChanges$.next(this.selectedData);
    this.clearSelected$.next(true);
  }

  clearAnonyms(): void {
    this.selectedData.anonyms = {
      opened: [],
      inventory: [],
      all: [],
    };
    this.selectedData.length = this.getSelectedLength();
    this.setMode('anonyms');
    this.selectedChanges$.next(this.selectedData);
  }

  clearDontwants(): void {
    this.selectedData.dontwants = {
      opened: [],
      inventory: [],
      all: [],
    };
    this.selectedData.length = this.getSelectedLength();
    this.setMode('dontwants');
    this.selectedChanges$.next(this.selectedData);
  }

  clearPresents(): void {
    this.selectedData.presents.all = [];
    this.selectedData.length = this.getSelectedLength();
    this.setMode('presents');
    this.selectedChanges$.next(this.selectedData);
  }

  getSelectedAnonyms(type: 'opened' | 'inventory' | 'all' = 'all'): Anonym[] {
    return this.selectedData.anonyms[type];
  }

  setSelectedAnonyms(anonyms: Anonym[], type: 'opened' | 'inventory' = 'opened') {
    this.selectedData.anonyms[type] = anonyms;
    this.selectedData.anonyms.all = [
      ...this.selectedData.anonyms.opened,
      ...this.selectedData.anonyms.inventory,
    ];
    this.selectedData.length = this.getSelectedLength();
    this.setMode('anonyms');
    this.selectedChanges$.next(this.selectedData);
  }

  getSelectedDontwants(type: 'opened' | 'inventory' | 'all' = 'all'): Dontwant[] {
    return this.selectedData.dontwants[type];
  }

  setSelectedDontwants(dontwants: Dontwant[], type: 'opened' | 'inventory' = 'opened') {
    this.selectedData.dontwants[type] = dontwants;
    this.selectedData.dontwants.all = [
      ...this.selectedData.dontwants.opened,
      ...this.selectedData.dontwants.inventory,
    ];
    this.selectedData.length = this.getSelectedLength();
    this.setMode('dontwants');
    this.selectedChanges$.next(this.selectedData);
  }

  getSelectedPresents(): technicalStuff[] {
    return this.selectedData.presents.all;
  }

  setSelectedPresents(presents: technicalStuff[]) {
    this.selectedData.presents.all = presents;
    this.selectedData.length = this.getSelectedLength();
    this.setMode('presents');
    this.selectedChanges$.next(this.selectedData);
  }

  getSelectedLength(): number {
    let length = 0;

    // Get Anonyms, Dontwants and Presents
    for (const categoryKey of Object.keys(this.selectedData).filter(prop => prop !== 'length')) {
      // from each category get property all and add its length
      const category = this.selectedData[categoryKey];
      length += category.all ? category.all.length : 0;
    }

    return length;
  }

  getSelectedData(): SelectedData {
    return this.selectedData;
  }

  // Set mode based on category of first user select
  // Mode is used for disabling the other categories, for print purposes
  // Print now supports three different table layouts based on the category of selected items
  // Therefore, user can't mix categories when selecting items
  // If is anonym or dontwant it's mode "anonym_dontwant"
  // If presents it's "present"
  // If reclamations it's "reclamation"
  setMode(category: 'anonyms' | 'dontwants' | 'presents' | 'reclamations'): void {
    switch (category) {
      // anonyms and dontwants are selected for the same mode
      // so if one is empty and the other has value, it's still in the same mode
      // if both are empty, mode is restarted
      case 'anonyms':
      case 'dontwants':
        if (this.selectedData[category].all.length && this.selectedData.mode !== 'anonym_dontwant') {
          this.selectedData.mode = 'anonym_dontwant';
        } else if (!this.selectedData.anonyms.all.length && !this.selectedData.dontwants.all.length) {
          this.selectedData.mode = '';
        }
        break;
      case 'presents':
        if (this.selectedData[category].all.length && this.selectedData.mode !== 'present') {
          this.selectedData.mode = 'present';
        } else if (!this.selectedData.presents.all.length) {
          this.selectedData.mode = '';
        }
        break;
      case 'reclamations':
        if (this.selectedData[category].all.length && this.selectedData.mode !== 'reclamation') {
          this.selectedData.mode = 'reclamation';
        } else if (!this.selectedData.reclamations.all.length) {
          this.selectedData.mode = '';
        }
        break;

    }
  }

  getMode(): SelectedMode {
    return this.selectedData.mode;
  }
}
