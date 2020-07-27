import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AngularFireFunctions } from '@angular/fire/functions';
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'app-password-access-dialog',
  templateUrl: './password-access-dialog.component.html',
  styleUrls: ['./password-access-dialog.component.scss']
})
export class PasswordAccessDialogComponent implements OnInit {
  public form: FormGroup;
  public isLoading: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private dialogRef: MatDialogRef<PasswordAccessDialogComponent>,
    private fb: FormBuilder,
    private fns: AngularFireFunctions,
    private dialogService: DialogService,
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      password: [
        '',
        [ Validators.required ],
      ]
    });
  }

  get password() { return this.form.get('password'); }

  onNoClick(): void {
    this.dialogRef.close(false);
  }

  onConfirmation() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.password.disable();
    const validateAdminPasswordCallable = this.fns.httpsCallable('validateAdminPassword');
    validateAdminPasswordCallable({ password: this.password.value})
      .subscribe(result => {
        // TODO: WHY IS THIS FUCKED???!?!?
        // You have to start typing to end the loading overlay
        // The snackbar opens in wrong possition
        console.warn('result', result);
        this.password.enable();
        this.isLoading = false;
        if (result) {
          this.dialogRef.close(true);
        } else {
          this.dialogService.openSnackBar(`Nesprávne heslo, prístup zamietnutý`);
        }
      });
  }

}
