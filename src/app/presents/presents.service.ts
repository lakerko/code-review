import { Injectable } from '@angular/core';

import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreCollection, CollectionReference, Query } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';

import { Observable } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

import { UserService } from 'src/app/shared/services/user.service';
import { DialogService } from 'src/app/shared/services/dialog.service';
import { User, History } from '../shared/shared.model';
import { technicalStuff } from './present.model';

@Injectable({
  providedIn: 'root'
})
export class PresentsService {

  constructor(
    private afAuth: AngularFireAuth,
    private db: AngularFirestore,
    private userService: UserService,
    private dialogService: DialogService,
  ) { }

  get timestamp() {
    return firebase.firestore.FieldValue.serverTimestamp();
  }

  getUnfulfilledtechnicalStuffsCollection(): AngularFirestoreCollection<technicalStuff> {
    const user = this.userService.getUser();
    return this.db.collection(`stores/${user.storeId}/technicalStuffs`, ref => this.getUnfulfilledQuery(ref, user).orderBy('createdAt', 'desc'));
  }

  getUnfulfilledQuery(query, user: User) {
    return user.role === 'technician'
      ? query.where('assignedTo.uid', '==', user.uid).where('status', '==', 'unfulfilled')
      : query.where('status', '==', 'unfulfilled');
  }

  getUnfulfilledtechnicalStuffs(): Observable<technicalStuff[]> {
    return this.getUnfulfilledtechnicalStuffsCollection().valueChanges({ idField: 'id' }).pipe(
      takeUntil(this.afAuth.authState.pipe(filter(u => !u)))
    );
  }


  getUnfulfilledFilteredtechnicalStuffs(userQueries): Observable<technicalStuff[]> {
    return this.getUnfulfilledtechnicalStuffsCollectionWithQuery(userQueries).valueChanges({ idField: 'id' }).pipe(
      takeUntil(this.afAuth.authState.pipe(filter(u => !u)))
    );
  }

  getUnfulfilledtechnicalStuffsCollectionWithQuery(userQueries): AngularFirestoreCollection<technicalStuff> {
    const user = this.userService.getUser();
    return this.db.collection(
      `stores/${user.storeId}/technicalStuffs`, ref => this.getUnfulfilledFilteredQuery(ref, userQueries)
    );
  }

  getUnfulfilledFilteredQuery(ref: CollectionReference, userQueries) {
    let query: Query = ref;

    if (!userQueries.map(userQuery => userQuery.key).some(key => key === 'dateAdded')) {
      query = query.orderBy('createdAt', 'desc');
    }
    userQueries.forEach(userQuery => {
      query = query.where(userQuery.key, userQuery.equality, userQuery.value);
    });
    query = query.where('status', '==', 'unfulfilled');

    return query;
  }

  getAvailableSecondarytechnicalStuffs() {
    const user = this.userService.getUser();
    return this.db.collection(
      `stores/${user.storeId}/technicalStuffs`, ref => this.getAvailableSecondarytechnicalStuffsQuery(ref, user)
    ).valueChanges({ idField: 'id' }).pipe(
      takeUntil(this.afAuth.authState.pipe(filter(u => !u)))
    );
  }

  getAvailableSecondarytechnicalStuffsQuery(query, user: User) {
    return user.role === 'technician'
      ? query.where('assignedTo.uid', '==', user.uid).where('tags', 'array-contains', 'router').where('status', '==', 'unfulfilled')
      : query.where('tags', 'array-contains', 'router').where('status', '==', 'unfulfilled');
  }

  gettechnicalStuff(technicalStuffId: string): Observable<any> {
    return this.db.collection(`stores/${this.userService.getUser().storeId}/technicalStuffs`).doc(technicalStuffId).valueChanges().pipe(
      takeUntil(this.afAuth.authState.pipe(filter(u => !u)))
    );
  }

  createtechnicalStuff(technicalStuffData: technicalStuff): void {
    const timestamp = this.timestamp;
    const requestPayload = {
      ...technicalStuffData,
      updatedAt: timestamp,
      createdAt: timestamp,
    };
    if (requestPayload.type === 'ROUTER' || requestPayload.type === 'GPROUTER') {
      if (!requestPayload.tags) {
        requestPayload.tags = [ 'router' ];
      } else if (!requestPayload.tags.includes('router')) {
        requestPayload.tags.push('router');
      }
    } else {
      if (requestPayload.tags && requestPayload.tags.includes('router')) {
        requestPayload.tags = requestPayload.tags.filter(tag => tag !== 'router');
      }
    }
    this.db.collection(`stores/${this.userService.getUser().storeId}/technicalStuffs`).add(requestPayload).then(reason => {
      console.log('reason', reason);
      this.dialogService.openSnackBar(`technicalStuff ${technicalStuffData.technicalStuff} bolo vytvorené`);
    });
  }


  edittechnicalStuff(payload): void {
    const storeId: string = this.userService.getUser().storeId;
    const batch = this.db.firestore.batch();

    const technicalStuffRef = this.db.collection(`stores/${storeId}/technicalStuffs`).doc(payload.technicalStuffId).ref;

    const requestPayload = {
      ...payload.technicalStuff,
      updatedAt: this.timestamp,
    };
    if (requestPayload.type === 'ROUTER' || requestPayload.type === 'GPROUTER') {
      technicalStuffRef.update('tags', firebase.firestore.FieldValue.arrayUnion('router'));
    } else {
      technicalStuffRef.update('tags', firebase.firestore.FieldValue.arrayRemove('router'));
    }


    /** */
    const correspondingtechnicalStuff = requestPayload.corresponding;
    const technicalStuffCorrespondingId = requestPayload.corresponding && requestPayload.corresponding.id
      ? requestPayload.corresponding.id
      : payload.deleteCorrespondingRelationship
        ? payload.deleteCorrespondingRelationship
        : null;


    if (payload.lostFulfillment) {
      requestPayload.corresponding = null;
    }
    /** */


    if (requestPayload.corresponding && requestPayload.corresponding.id) {
      technicalStuffRef.update('tags', firebase.firestore.FieldValue.arrayUnion('corresponding-parent'));
    } else {
      technicalStuffRef.update('tags', firebase.firestore.FieldValue.arrayRemove('corresponding-parent'));
      technicalStuffRef.update('tags', firebase.firestore.FieldValue.arrayRemove('corresponding-child'));
    }

    const correspondingtechnicalStuffRef = technicalStuffCorrespondingId ? this.db.collection(`stores/${storeId}/technicalStuffs`).doc(technicalStuffCorrespondingId).ref : null;

    if (correspondingtechnicalStuff) {

      const linkedProperties: any = {
        customerName: requestPayload.customerName,
        customerPhone: requestPayload.customerPhone,
        status: requestPayload.status,
      };
      if (requestPayload.status === 'unfulfilled') {
        correspondingtechnicalStuffRef.update('tags', firebase.firestore.FieldValue.arrayRemove('corresponding-child'));
        correspondingtechnicalStuffRef.update('tags', firebase.firestore.FieldValue.arrayRemove('corresponding-parent'));
        linkedProperties.corresponding = null;
      } else {
        correspondingtechnicalStuffRef.update('tags', firebase.firestore.FieldValue.arrayUnion('corresponding-child'));
        linkedProperties.corresponding = {
          id: payload.technicalStuffId,
          technicalStuff: payload.technicalStuffId,
        };
      }

      batch.update(correspondingtechnicalStuffRef, linkedProperties);
    } else if (payload.deleteCorrespondingRelationship) {
      const linkedProperties: any = {
        customerName: null,
        customerPhone: null,
        status: 'unfulfilled',
      };
      correspondingtechnicalStuffRef.update('tags', firebase.firestore.FieldValue.arrayRemove('corresponding-child'));
      correspondingtechnicalStuffRef.update('tags', firebase.firestore.FieldValue.arrayRemove('corresponding-parent'));

      batch.update(correspondingtechnicalStuffRef, linkedProperties);
    }

    // toto prerobit, aby anonym mal samostatne id, nie take ako technicalStuff
    // a technicalStuffID a technicalStuffRef by mali byt polia
    // ked vytvorim anonym, tak ho napojit na tie technicalStuffka s ktorymi bol vytovreny, teda tym technicalStuffkam dat odkaz na anonym

    // technicalStuff ref a technicalStuff id na povodne technicalStuffko a pripadne aj na additional
    if (payload.history.changedProperties.includes('status') && payload.history.changedValues.status.newValue === 'fulfilled') {
      const newAnonymRef = this.db.collection(`stores/${storeId}/anonyms`).doc(payload.technicalStuffId).ref;
      // requestPayload.anonymRef = newAnonymRef; // treba kvoli updatom

      const relationships = [
        {
          id: payload.technicalStuffId,
          ref: technicalStuffRef
        },
      ];
      if (correspondingtechnicalStuffRef) {
        relationships.push({
          id: technicalStuffCorrespondingId,
          ref: correspondingtechnicalStuffRef,
        });
      }
      const anonymPayload: any = {
        technicalStuff: payload.technicalStuff.technicalStuffAnonym || null,
        typeAnonym: payload.technicalStuff.typeAnonym,
        otherTechnicalStuffAnonym: payload.technicalStuff.otherTechnicalStuffAnonym,

        technicalStuff2: payload.technicalStuff.technicalStuff,
        type: payload.technicalStuff.type,
        otherTechnicalStuff: payload.technicalStuff.otherTechnicalStuff,

        createdBy: payload.technicalStuff.createdBy,
        assignedTo: payload.technicalStuff.assignedTo,
        customerName: payload.technicalStuff.customerName,
        customerPhone: payload.technicalStuff.customerPhone,
        createdAt: this.timestamp,
        updatedAt: this.timestamp,
        assignedAt: payload.technicalStuff.assignedAt,
        hsDispatchDate: null,
        dispatched: false,
        dispatchedByTechnician: false,
        note: payload.technicalStuff.note || null,
        sp: null,
        technicalStuffRef,
        technicalStuffId: payload.technicalStuffId,
        relationships,
      };
      if (requestPayload.corresponding) {
        anonymPayload.correspondingtechnicalStuff = requestPayload.corresponding.technicalStuff;
        anonymPayload.correspondingtechnicalStuffType = requestPayload.corresponding.type;
        anonymPayload.correspondingtechnicalStuffotherTechnicalStuff = requestPayload.corresponding.otherTechnicalStuff;
        anonymPayload.correspondingtechnicalStuffId = requestPayload.corresponding.id;
      }
      if (requestPayload.correspondingAnonym) {
        anonymPayload.correspondingtechnicalStuffAnonym = requestPayload.correspondingAnonym.technicalStuff;
        anonymPayload.correspondingtechnicalStuffAnonymType = requestPayload.correspondingAnonym.type;
        anonymPayload.correspondingtechnicalStuffAnonymotherTechnicalStuff = requestPayload.correspondingAnonym.otherTechnicalStuff;
      }
      batch.set(newAnonymRef, anonymPayload);
    } else if (payload.technicalStuff.status === 'fulfilled') {
      const anonymRef = this.db.collection(`stores/${storeId}/anonyms`).doc(payload.technicalStuffId).ref;
      // requestPayload.anonymRef = anonymRef;
      batch.update(anonymRef, {
        ...this.getChangedPropertiesFromtechnicalStuffToAnonym(payload.history),
        updatedAt: this.timestamp,
      });
    }


    batch.update(technicalStuffRef, requestPayload);

    batch.commit().then(value => {
      console.log('value', value);
      this.dialogService.openSnackBar(`technicalStuff ${payload.technicalStuff.technicalStuff} bolo upravené`);
    }, reason => {
      console.log('reason', reason);
    }).catch(error => {
      console.log('error', error);
    });
  }

  deletetechnicalStuff(technicalStuffId: string) {
    const storeId: string = this.userService.getUser().storeId;
    this.db.collection(`stores/${storeId}/technicalStuffs`).doc(technicalStuffId).delete().then(() => {
      this.dialogService.openSnackBar(`technicalStuff bolo zmazané`);
    });
  }

  getChangedPropertiesFromtechnicalStuffToAnonym(historyPayload: History): { [key: string]: any } {
    const linkedProperties = [ 'technicalStuff', 'type', 'otherTechnicalStuff', 'createdBy', 'assignedTo', 'customerName', 'customerPhone', ];
    const changedPropertiesList = historyPayload.changedProperties.filter(property => linkedProperties.includes(property));
    const changesForAnonym: { [key: string]: any } = {};

    changedPropertiesList.forEach(property => {
      changesForAnonym[property === 'technicalStuff' ? 'technicalStuff2' : property] = historyPayload.changedValues[property].newValue;
    });

    console.warn('changesForAnonym', changesForAnonym);
    return changesForAnonym;
  }

  batchCreatetechnicalStuffs(technicalStuffsList: any[]) {
    console.log('technicalStuffsList', technicalStuffsList);
    const storeId: string = this.userService.getUser().storeId;
    const batch = this.db.firestore.batch();
    const technicalStuffIdList = {};

    technicalStuffsList.forEach(technicalStuff => {
      const timestamp = this.timestamp;
      if (!technicalStuff.createdAt) {
        technicalStuff.createdAt = timestamp;
      }
      if (!technicalStuff.updatedAt) {
        technicalStuff.updatedAt = timestamp;
      }
      // zrefactoruj. nemusis kukat ci existuju tags, lebo sak je to create
      // ale urob to cez servicu aj s tym co je v edit technicalStuff dialogu
      if (technicalStuff.type === 'ROUTER' || technicalStuff.type === 'GPROUTER') {
        if (!technicalStuff.tags) {
          technicalStuff.tags = [ 'router' ];
        } else if (!technicalStuff.tags.includes('router')) {
          technicalStuff.tags.push('router');
        }
      } else {
        if (technicalStuff.tags && technicalStuff.tags.includes('router')) {
          technicalStuff.tags = technicalStuff.tags.filter(tag => tag !== 'router');
        }
      }
      const newtechnicalStuffId = this.db.createId();
      const newtechnicalStuffRef = this.db.collection(`stores/${storeId}/technicalStuffs`).doc(newtechnicalStuffId).ref;
      batch.set(newtechnicalStuffRef, technicalStuff);
      technicalStuffIdList[technicalStuff.technicalStuff] = newtechnicalStuffId;
    });
    return batch.commit();
  }
}
