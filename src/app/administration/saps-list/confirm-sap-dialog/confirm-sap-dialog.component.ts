import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-otherTechnicalStuff-dialog',
  templateUrl: './confirm-otherTechnicalStuff-dialog.component.html',
  styleUrls: ['./confirm-otherTechnicalStuff-dialog.component.scss']
})
export class ConfirmotherTechnicalStuffDialogComponent implements OnInit {
  public form: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private dialogRef: MatDialogRef<ConfirmotherTechnicalStuffDialogComponent>,
    private fb: FormBuilder,
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      otherTechnicalStuff: [
        '',
        [ Validators.required, Validators.pattern(this.data.otherTechnicalStuff) ],
      ]
    });
  }

  get otherTechnicalStuff() { return this.form.get('otherTechnicalStuff'); }

  onNoClick(): void {
    this.dialogRef.close(false);
  }

  onSave() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.dialogRef.close(true);
  }

}
