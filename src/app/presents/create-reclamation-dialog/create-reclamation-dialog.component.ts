import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-create-reclamation-dialog',
  templateUrl: './create-reclamation-dialog.component.html',
  styleUrls: ['./create-reclamation-dialog.component.scss']
})
export class CreateReclamationDialogComponent implements OnInit {
  public form: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<CreateReclamationDialogComponent>,
    private fb: FormBuilder,
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      defect: [
        ''
      ],
    });
  }

  get defect() { return this.form.get('defect'); }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
