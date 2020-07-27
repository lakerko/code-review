import { Injectable } from '@angular/core';

import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';

import { Observable } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

import { Store } from './administration.model';
import { otherTechnicalStuffDef } from '../shared/shared.model';

@Injectable({
  providedIn: 'root'
})
export class AdministrationService {

  constructor(
    private afAuth: AngularFireAuth,
    private db: AngularFirestore,
  ) { }

  get timestamp(): firebase.firestore.FieldValue {
    return firebase.firestore.FieldValue.serverTimestamp();
  }

  getStoresCollection(): AngularFirestoreCollection<any> {
    return this.db.collection(`stores`);
  }

  getStores(): Observable<Store[]> {
    return this.getStoresCollection().valueChanges({ idField: 'id' }).pipe(
      takeUntil(this.afAuth.authState.pipe(filter(u => !u)))
    );
  }

  createotherTechnicalStuff(otherTechnicalStuffData: otherTechnicalStuffDef): Promise<any> {
    const timestamp = this.timestamp;
    const requestPayload = {
      ...otherTechnicalStuffData,
      updatedAt: timestamp,
      createdAt: timestamp,
    };

    return this.db.collection('otherTechnicalStuffDefs').add(requestPayload);
  }

  editotherTechnicalStuff(otherTechnicalStuffData: otherTechnicalStuffDef, otherTechnicalStuffId: string): Promise<void> {
    const requestPayload = {
      ...otherTechnicalStuffData,
      updatedAt: this.timestamp,
    };
    return this.db.collection('otherTechnicalStuffDefs').doc(otherTechnicalStuffId).update(requestPayload);
  }

}
