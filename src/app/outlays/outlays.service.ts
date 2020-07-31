import { Injectable } from '@angular/core';

import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreCollection, CollectionReference, Query } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';

import { Observable } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

import { UserService } from 'src/app/shared/services/user.service';
import { DialogService } from 'src/app/shared/services/dialog.service';
import { CategoryQuery } from '../shared/shared.model';
import { Dontwant } from './dontwant.model';

@Injectable({
  providedIn: 'root'
})
export class DontwantsService {

  constructor(
    private afAuth: AngularFireAuth,
    private db: AngularFirestore,
    private userService: UserService,
    private dialogService: DialogService,
  ) { }

  get timestamp() {
    return firebase.firestore.FieldValue.serverTimestamp();
  }

  getDontwantCollection(queryType: CategoryQuery): AngularFirestoreCollection<any> {
    const user = this.userService.getUser();
    return this.db.collection<Dontwant>(`stores/${user.storeId}/dontwants`, ref => this.getDontwantsQuery(ref, queryType, user));
  }

  getDontwantsQuery(ref: CollectionReference, queryType: CategoryQuery, user) {
    let query: Query = ref;
    if (user.role === 'technician') {
      query = query.where('assignedTo.uid', '==', user.uid);
    }
    if (queryType === 'opened') {
      query = query.where('dispatched', '==', false);
    } else if (queryType === 'inventory') {
      query = query.where('dispatched', '==', true);
    }
    query = query.orderBy('createdAt', 'desc');

    return query;
  }

  getDontwants(queryType: CategoryQuery): Observable<Dontwant[]> {
    return this.getDontwantCollection(queryType).valueChanges({ idField: 'id' }).pipe(
      takeUntil(this.afAuth.authState.pipe(filter(u => !u)))
    );
  }

  createDontwant(dontwantData: Dontwant): void {
    const timestamp = this.timestamp;
    const requestPayload = {
      ...dontwantData,
      updatedAt: timestamp,
      createdAt: timestamp,
    };
    this.db.collection(`stores/${this.userService.getUser().storeId}/dontwants`).add(requestPayload).then(fulfilled => {
      console.log('reason', fulfilled);
      this.dialogService.openSnackBar(`Dontwantie bolo pridané`);
    });
  }

  editDontwant(dontwantPayload: Dontwant | any, dontwantId: string): void {
    console.warn('dontwantId', dontwantId);
    const storeId: string = this.userService.getUser().storeId;
    const requestPayload = {
      ...dontwantPayload,
      updatedAt: this.timestamp,
    };
    const batch = this.db.firestore.batch();

    const dontwantRef = this.db.collection(`stores/${storeId}/dontwants`).doc(dontwantId).ref;
    batch.update(dontwantRef, requestPayload);

    batch.commit().then(value => {
      console.log('value', value);
      this.dialogService.openSnackBar(`Dontwantie bolo upravené`);
    }, reason => {
      console.log('reason', reason);
    }).catch(error => {
      console.log('error', error);
    });
  }

  deleteDontwant(dontwantId: string) {
    const storeId: string = this.userService.getUser().storeId;
    this.db.collection(`stores/${storeId}/dontwants`).doc(dontwantId).delete().then(() => {
      this.dialogService.openSnackBar(`Dontwantie bolo zmazané`);
    });
  }

  batchCreateDontwants(dontwantsList: any[]) {
    // console.log('dontwantsList', dontwantsList);
    // const storeId: string = this.userService.getUser().storeId;
    // const batch = this.afs.firestore.batch();

    // dontwantsList.forEach(technicalStuff => {
    //   const newDontwantId = this.afs.createId();
    //   const newDontwantRef = this.afs.collection(`stores/${storeId}/dontwants`).doc(newDontwantId).ref;
    //   batch.set(newDontwantRef, technicalStuff);
    // });
    // batch.commit().then(value => {
    //   console.log('value', value);
    // }, reason => {
    //   console.log('reason', reason);
    // }).catch(error => {
    //   console.log('error', error);
    // });
  }

}
