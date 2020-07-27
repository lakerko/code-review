import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { map, takeUntil, filter } from 'rxjs/operators';

import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireAnalytics } from '@angular/fire/analytics';
import * as firebase from 'firebase/app';
import 'firebase/firestore';

import { UserService } from 'src/app/shared/services/user.service';
import { User, EmployeeInfo, Employee, otherTechnicalStuffDef } from '../shared.model';
import { SelectedDataService } from '../services/selected-data.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  public loginSubject = new Subject<any>();
  public otherTechnicalStuffs$: BehaviorSubject<otherTechnicalStuffDef[]> = new BehaviorSubject([]);

  constructor(
    private router: Router,
    private db: AngularFirestore,
    private afAuth: AngularFireAuth,
    private analytics: AngularFireAnalytics,
    private userService: UserService,
    private selectedDataService: SelectedDataService,
  ) { }

  getTechniciansCollection(): AngularFirestoreCollection<any> {
    return this.db.collection(
      `stores/${this.userService.getUser().storeId}/employees`, ref => ref.where('role', '==', 'technician'
    ));
  }

  getTechnicians(): Observable<EmployeeInfo[]> {
    return this.getTechniciansCollection().snapshotChanges().pipe(
      takeUntil(this.afAuth.authState.pipe(filter(u => !u))),
      map(employees => employees.map(employee => {
        const data = employee.payload.doc.data() as Employee;
        return {
          uid: data.uid,
          displayName: data.displayName,
        };
      }))
    );
  }

  login(email: string, password: string) {
    this.afAuth.signInWithEmailAndPassword(email, password)
      .then((credentials: firebase.auth.UserCredential) => {
        this.analytics.logEvent('login', { method: credentials && credentials.credential ? credentials.credential.signInMethod : '' });
        this.getUserData(credentials.user);
      },
      (reason) => {
        console.warn('reason', reason);
        this.loginSubject.next(reason);
      })
      .catch((error) => {
        console.warn('error', error);
      });
  }

  logout() {
    this.afAuth.signOut().then(() => {
      this.selectedDataService.clearSelection();
      this.userService.updateUser(null);
      this.router.navigate(['/login']);
    }, (reason) => {
      console.warn('logout reason', reason);
    }).catch((error) => {
      console.warn('logout error', error);
    });
  }

  userCheck() {
    this.afAuth.user.pipe(
      takeUntil(this.afAuth.authState.pipe(filter(u => !u)))
    ).subscribe((user: firebase.User) => {
      console.warn('userCheck user', user);
      this.getUserData(user);
    });
  }

  getUserData(user) {
    console.warn('getUserData user', user);
    if (!user) {
      this.userService.updateUser(null);
      this.logout();
      return;
    }

    this.getotherTechnicalStuffs().subscribe(otherTechnicalStuffs => {
      this.otherTechnicalStuffs$.next(otherTechnicalStuffs);
    });

    this.db.doc(`employees/${user.uid}`).valueChanges().pipe(
      takeUntil(this.afAuth.authState.pipe(filter(u => !u)))
    ).subscribe((userData: User) => {
      console.warn('getUserData -> userData', userData);
      this.userService.updateUser(userData);
      if (!userData) {
        this.logout();
      } else {
        this.router.navigate(['/anonyms']);
      }
    });
  }

  get timestamp(): firebase.firestore.FieldValue {
    return firebase.firestore.FieldValue.serverTimestamp();
  }

  getTimestampFromDate(dateValue: Date): firebase.firestore.Timestamp {
    return firebase.firestore.Timestamp.fromDate(dateValue);
  }

  batchUpdateDocuments(ids: string[], updateData, category: string): Promise<any>[] {
    const storeId: string = this.userService.getUser().storeId;

    let start = 0;
    const incrementor = 100;
    const promises = [];

    while (start < ids.length) {
      const batch = this.db.firestore.batch();

      ids.slice(start, start + incrementor).forEach(id => {
        const docRef = this.db.collection(`stores/${storeId}/${category}`).doc(id).ref;
        const data = {
          ...updateData,
          updatedAt: this.timestamp,
        };
        batch.update(docRef, data);
      });

      promises.push(batch.commit());

      start += incrementor;
    }

    return promises;
  }

  batchDeleteDocuments(ids: string[], category: string): Promise<any>[] {
    const storeId: string = this.userService.getUser().storeId;

    let start = 0;
    const incrementor = 100;
    const promises = [];

    while (start < ids.length) {
      const batch = this.db.firestore.batch();

      ids.slice(start, start + incrementor).forEach(id => {
        const docRef = this.db.collection(`stores/${storeId}/${category}`).doc(id).ref;
        batch.delete(docRef);
      });

      promises.push(batch.commit());

      start += incrementor;
    }

    return promises;
  }

  getotherTechnicalStuffs(): Observable<otherTechnicalStuffDef[]> {
    return this.db.collection<otherTechnicalStuffDef>('otherTechnicalStuffDefs', ref => ref.orderBy('otherTechnicalStuff', 'asc'))
      .valueChanges({ idField: 'id' })
      .pipe(
        takeUntil(this.afAuth.authState.pipe(filter(u => !u)))
      );
  }

}
