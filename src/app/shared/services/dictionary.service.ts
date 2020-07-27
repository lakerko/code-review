import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DictionaryService {

  constructor() { }

  getDisplayLabel(value: string): string {
    const dictionary = {
      technicalStuff: 'technicalStuff',
      technicalStuffOriginCorresponding: 'technicalStuff routera',
      technicalStuffCorresponding: 'technicalStuff routera',
      technicalStuff2: 'technicalStuff2',
      note: 'Poznámka',
      hsDispatchDate: 'Dátum odoslania',
      dateAdded: 'Dátum pridania',
      sp: 'Servisná požiadavka',
      type: 'Typ',
      assignedTo: 'Pridelený technik',
      customerName: 'Meno zákazníka',
      customerPhone: 'Tel. č. služby',
      isDefective: 'Predpredajná reklamácia',
      status: 'Stav',
    };

    return dictionary[value];
  }
}
