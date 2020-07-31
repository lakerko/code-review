import { Injectable, TemplateRef, Type } from '@angular/core';
import { Router } from '@angular/router';

import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarRef, SimpleSnackBar } from '@angular/material/snack-bar';

import { tap } from 'rxjs/operators';

interface CreateDialog<T> {
  component: Type<T> | TemplateRef<T>;
  data?: {
    title?: string;
    textContent?: string;
    [k: string]: any;
  };
  width?: string;
  minWidth?: string;
}


@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private defaultTitle: string = 'Sorry to bother you';

  constructor(
    private router: Router,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
  ) { }

  createDialogRef<T>(config: CreateDialog<T>): MatDialogRef<T> {
    const data = config.data || { title: this.defaultTitle };
    if (!data.title) {
      data.title = this.defaultTitle;
    }

    return this.dialog.open(config.component, {
      width: config.width || !config.minWidth ? '700px' : '',
      minWidth: config.minWidth,
      data,
    });
  }

  openSnackBar(message: string, duration: number | string = 3500, withAction = true): MatSnackBarRef<SimpleSnackBar> {
    if (duration === 'manual') {
      return this.snackBar.open(message, withAction ? 'Zavrieť' : '');
    } else {
      return this.snackBar.open(message, 'Zavrieť', { duration: duration as number });
    }
  }

  authError() {
    this.snackBar.open('Musíte byť prihlásený!', 'OK', { duration: 3000 });

    return this.snackBar._openedSnackBarRef
      .onAction()
      .pipe(
        tap(() => {
          this.router.navigate(['/login']);
        })
      )
      .subscribe();
  }

  closeSnackBar(): void {
    this.snackBar.dismiss();
  }
}
