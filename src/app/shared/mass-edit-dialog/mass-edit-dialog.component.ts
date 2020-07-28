import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { Subscription } from 'rxjs';

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { DataService } from '../data/data.service';
import { HelperService } from '../services/helper.service';
import { DateService } from '../services/date.service';
import { EmployeeInfo } from '../shared.model';

@Component({
  selector: 'app-mass-edit-dialog',
  templateUrl: './mass-edit-dialog.component.html',
  styleUrls: ['./mass-edit-dialog.component.scss']
})
export class MassEditDialogComponent implements OnInit, OnDestroy {
  private technicians$: Subscription;
  public form: FormGroup;
  public displayTechnicians: EmployeeInfo[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<MassEditDialogComponent>,
    private fb: FormBuilder,
    private dataService: DataService,
    private helper: HelperService,
    private dateService: DateService,
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {
    console.log('this.data.isTechnician', this.data.isTechnician);
    if (this.data.type === 'unfulfilled') {
      this.getTechnicians();
    }

    this.form = this.fb.group({
      assignedTo: [ null ],
      hsDispatchDate: [ this.dateService.getCurrentDateAsString() ]
    });
  }

  getTechnicians() {
    this.technicians$ = this.dataService.getTechnicians().subscribe((technicians: EmployeeInfo[]) => {
      this.displayTechnicians = this.helper.getTechniciansWithEmptyOption(technicians);
    });
  }

  onNoClick(): void {
    this.dialogRef.close(false);
  }

  onSave() {
    const rawData = this.form.getRawValue();
    const result: any = {};
    if (rawData.assignedTo) {
      const assignedTechnician = this.displayTechnicians.find((technician) => technician.uid === rawData.assignedTo);
      result.assignedTo = this.helper.getEmployeeInfo(assignedTechnician);
    }
    if (rawData.hsDispatchDate) {
      const validDate = this.dateService.getValidDateObjectFromString(rawData.hsDispatchDate);
      if (this.data.isTechnician) {
        result.hsDispatchDateTechnician = validDate;
        result.dispatchedByTechnician = true;
      } else {
        result.hsDispatchDate = validDate;
        result.dispatched = true;
      }
    }
    this.dialogRef.close(result);
  }

  ngOnDestroy() {
    if (this.technicians$) {
      this.technicians$.unsubscribe();
    }
  }

}
