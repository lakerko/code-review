import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { User } from '../shared.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userData: User;
  public user$: BehaviorSubject<User> = new BehaviorSubject(null);

  constructor() { }

  getUser(): User {
    // console.log('****this.userData', this.userData);
    return {
      ...this.userData,
      isTechnician: this.userData && this.userData.role === 'technician',
    };
  }

  // TODO: Treba toto priradovat po jednom????
  updateUser(credentials: User): void {
    this.userData = credentials ? {
      displayName: credentials.displayName,
      uid: credentials.uid,
      email: credentials.email,
      role: credentials.role,
      storeId: credentials.storeId,
      isTechnician: credentials.role === 'technician',
      login: credentials.login,
    } : null;
    this.user$.next(this.userData);
  }
}
