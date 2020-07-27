import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { AngularFireFunctions } from '@angular/fire/functions';

export interface Role {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-create-user-dialog',
  templateUrl: './create-user-dialog.component.html',
  styleUrls: ['./create-user-dialog.component.scss']
})
export class CreateUserDialogComponent implements OnInit {
  public roles: Role[] = [
    { value: 'admin', viewValue: 'Admin' },
    { value: 'technician', viewValue: 'Technik' },
  ];

  public form: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<CreateUserDialogComponent>,
    private fb: FormBuilder,
    private fns: AngularFireFunctions,
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {
    const store = this.data.store ? this.data.store : undefined;
    this.form = this.fb.group({
      store: [
        store ? store.name : '',
        [ Validators.required ],
      ],
      name: [
        '',
        [ Validators.required, ]
      ],
      email: [
        '',
        [ Validators.required, Validators.email, ]
      ],
      role: [
        '',
        [ Validators.required, ]
      ],
      login: [
        '',
        [ Validators.required, ]
      ]
    });
  }

  get name() { return this.form.get('name'); }
  get email() { return this.form.get('email'); }
  get role() { return this.form.get('role'); }
  get login() { return this.form.get('login'); }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSaveUser() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const createUserCallable = this.fns.httpsCallable('createUserAsAdmin');
    createUserCallable(this.form.getRawValue()).subscribe(result => {
      console.warn('result', result);
    });
  }

}
