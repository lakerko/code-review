import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { AngularFireAnalytics } from '@angular/fire/analytics';

import { UserService } from 'src/app/shared/services/user.service';
import { DateService } from 'src/app/shared/services/date.service';
import { User } from 'src/app/shared/shared.model';

@Component({
  selector: 'app-edit-reclamation-dialog',
  templateUrl: './edit-reclamation-dialog.component.html',
  styleUrls: ['./edit-reclamation-dialog.component.scss']
})
export class EditReclamationDialogComponent implements OnInit {
  public form: FormGroup;
  public user: User;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<EditReclamationDialogComponent>,
    private fb: FormBuilder,
    private analytics: AngularFireAnalytics,
    private dateService: DateService,
    private userService: UserService,
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    this.user = this.userService.getUser();
    this.form = this.fb.group({
      technicalStuff: [{
        value: {
          technicalStuff: this.data.technicalStuff || null,
          type: this.data.type || null,
          otherTechnicalStuff: this.data.otherTechnicalStuff || null,
        },
        disabled: true,
      }],
      dateAdded: [
        {
          value: this.data.dateAdded
            ? this.dateService.getValidDateStringFormatFromDate(this.data.dateAdded)
            : null,
          disabled: this.user.isTechnician,
        },
        [ Validators.required, this.dateService.validateDate(this.dateService) ],
      ],
      reclamationDate: [
        {
          value: this.data.reclamationDate
            ? this.dateService.getValidDateStringFormatFromDate(this.data.reclamationDate)
            : null,
          disabled: true,
        },
        [ Validators.required, this.dateService.validateDate(this.dateService) ],
      ],
      hsDispatchDate: [
        {
          value: this.data.hsDispatchDate
            ? this.dateService.getValidDateStringFormatFromDate(this.data.hsDispatchDate)
            : null,
          disabled: this.user.isTechnician,
        },
        [ Validators.required, this.dateService.validateDate(this.dateService) ],
      ],
      assignedTo: [
        {
          value: this.data.assignedTo ? this.data.assignedTo.uid : null,
          disabled: this.user.isTechnician,
        },
      ],
      defect: [
        this.data.defect || '',
        [ Validators.required ],
      ],
    });
  }

  get technicalStuff() { return this.form.get('iemi'); }
  get dateAdded() { return this.form.get('dateAdded'); }
  get reclamationDate() { return this.form.get('reclamationDate'); }
  get hsDispatchDate() { return this.form.get('hsDispatchDate'); }
  get assignedTo() { return this.form.get('assignedTo'); }
  get defect() { return this.form.get('defect'); }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
