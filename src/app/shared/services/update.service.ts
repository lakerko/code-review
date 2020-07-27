import { Injectable, ApplicationRef } from '@angular/core';

import { MatSnackBar } from '@angular/material/snack-bar';
import { SwUpdate } from '@angular/service-worker';

import { concat, interval } from 'rxjs';
import { first } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UpdateService {

  constructor(
    private appRef: ApplicationRef,
    private updates: SwUpdate,
    private snackbar: MatSnackBar,
  ) {
    // Allow the app to stabilize first, before starting polling for updates with `interval()`.
    const appIsStable$ = appRef.isStable.pipe(first(isStable => isStable === true));
    const everySixHours$ = interval(6 * 60 * 60 * 1000);
    const everySixHoursOnceAppIsStable$ = concat(appIsStable$, everySixHours$);

    everySixHoursOnceAppIsStable$.subscribe(() => updates.checkForUpdate());

    this.updates.available.subscribe(() => {
      this.notifyAboutUpdate();
    });

  }

  notifyAboutUpdate() {
    console.warn('notifyAboutUpdate');
    if (this.updates.isEnabled) {
      return;
    }
    const snack = this.snackbar.open(
      'Nová verzia je k dispozícii, prosím načítajte znova aplikáciu',
      'Načítať znova',
      { duration: 20000 }
    );

    snack
      .onAction()
      .subscribe(() => {
        window.location.reload();
      });
  }
}
