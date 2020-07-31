import { Injectable } from '@angular/core';

import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreCollection, CollectionReference, Query } from '@angular/fire/firestore';
import { AngularFireFunctions } from '@angular/fire/functions';
import * as firebase from 'firebase/app';

import { Observable } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

import { UserService } from 'src/app/shared/services/user.service';
import { DialogService } from 'src/app/shared/services/dialog.service';
import { Anonym } from './anonym.model';
import { CategoryQuery, User } from '../shared/shared.model';

@Injectable({
  providedIn: 'root'
})
export class AnonymsService {

  constructor(
    private afAuth: AngularFireAuth,
    private db: AngularFirestore,
    private fns: AngularFireFunctions,
    private userService: UserService,
    private dialogService: DialogService,
  ) { }

  get timestamp(): firebase.firestore.FieldValue {
    return firebase.firestore.FieldValue.serverTimestamp();
  }

  editAnonym(payload) {
    const storeId: string = this.userService.getUser().storeId;
    const batch = this.db.firestore.batch();

    const anonymRef = this.db.collection(`stores/${storeId}/anonyms`).doc(payload.anonymId).ref;
    batch.update(anonymRef, {
      ...payload.anonymPayload,
      updatedAt: this.timestamp,
    });

    if (payload.technicalStuffPayload && payload.technicalStuffId) {
      const technicalStuffRef = this.db.collection(`stores/${storeId}/technicalStuffs`).doc(payload.technicalStuffId).ref;

      if (technicalStuffRef) {
        batch.update(technicalStuffRef, {
          ...payload.technicalStuffPayload,
          updatedAt: this.timestamp,
        });
      }
    }

    batch.commit().then(value => {
      console.log('value', value);
      this.dialogService.openSnackBar(`Anonym bola upravená`);
    }, reason => {
      console.log('reason', reason);
    }).catch(error => {
      console.log('error', error);
    });
  }

  editAnonymNew(payload) {
    console.warn('payload', payload);

    // ZATIAL NEBUDEM UDPDATOVAT technicalStuff, ALE IBA EXCHANGE
    // ZATIAL NEBUDEM UPDATOVAT HISTORIU

    // ak bola zmena v technicalStuffData tak musim updanut vsetky technicalStuffka
    // ak nebola, ale bolo zmenene nejake technicalStuff, tka ho musim updanut
    // ak bolo zmenene technicalStuff tak to znamena ze vsetky data co malo povodne technicalStuff, musi mat teraz to nove

    // inak updatujem len vymenu ako taku, ak bolo zmenene iba SP alebo dispatchDate alebo tak

    const storeId: string = this.userService.getUser().storeId;
    const batch = this.db.firestore.batch();

    const anonymRef = this.db.collection(`stores/${storeId}/anonyms`).doc(payload.anonymId).ref;
    batch.update(anonymRef, {
      ...payload.anonym,
      updatedAt: this.timestamp,
    });
    batch.commit().then(value => {
      console.log('value', value);
      this.dialogService.openSnackBar(`Anonym bola upravená`);
    }, reason => {
      console.log('reason', reason);
    }).catch(error => {
      console.log('error', error);
    });
  }

  deleteAnonym(anonymId: string) {
    const snackBarRef = this.dialogService.openSnackBar(`Mažem výmenu a Presentové technicalStuff presúvam do present`, 'manual', false);
    const deleteAnonym = this.fns.httpsCallable('deleteAnonymsAndMoveToPresents');
    deleteAnonym({ anonymIds: [anonymId] }).subscribe(result => {
      console.warn('result', result);
      snackBarRef.dismiss();
      if (result === 'FAILURE') {
        this.dialogService.openSnackBar(`Došlo k chybe`);
      }
    });
  }

  massDeleteAnonyms(anonymIds: string[]) {
    const deleteAnonyms = this.fns.httpsCallable('deleteAnonymsAndMoveToPresents');
    return deleteAnonyms({ anonymIds }).toPromise();
  }

  getAnonymsCollection(queryType: CategoryQuery): AngularFirestoreCollection<any> {
    const user = this.userService.getUser();
    console.warn('!!!!!user', user);
    return this.db.collection<Anonym>(`stores/${user.storeId}/anonyms`,
      ref => this.getAnonymsQuery(ref, queryType, user)
    );
  }

  getAnonymsQuery(ref: CollectionReference, queryType: CategoryQuery, user: User) {
    let query: Query = ref;
    if (user.role === 'technician') {
      query = query.where('assignedTo.uid', '==', user.uid)/*.where('dispatchedByTechnician', '==', false)*/;
    }

    if (queryType === 'opened') {
      return query.where('dispatched', '==', false).orderBy('createdAt', 'desc');
    } else if (queryType === 'inventory') {
      return query.where('dispatched', '==', true).orderBy('createdAt', 'desc');
    }
    /* else if (queryType.target !== undefined && queryType.value !== undefined) {
      return query.orderBy(queryType.target, 'desc').where(queryType.target, '>=', queryType.value)
      .where(queryType.target, '<', `${queryType.value}\uf8ff`);
    } */
  }

  getAnonyms(queryType: CategoryQuery): Observable<Anonym[]> {
    return this.getAnonymsCollection(queryType).valueChanges({ idField: 'id' }).pipe(
      takeUntil(this.afAuth.authState.pipe(filter(u => !u)))
    );
  }

  batchCreateAnonyms(anonymsList: any[]) {
    // console.log('anonymsList', anonymsList);
    // const storeId: string = this.userService.getUser().storeId;
    // const batch = this.afs.firestore.batch();

    // anonymsList.forEach(technicalStuff => {
    //   const newAnonymId = this.afs.createId();
    //   const newAnonymRef = this.afs.collection(`stores/${storeId}/anonyms`).doc(newAnonymId).ref;
    //   batch.set(newAnonymRef, technicalStuff);
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
