import { Component, OnInit, Inject } from '@angular/core';

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';

import { HelperService } from '../../shared/services/helper.service';
import { DateService } from '../../shared/services/date.service';
import { DialogService } from '../../shared/services/dialog.service';
import { UserService } from 'src/app/shared/services/user.service';
import { PresentsService } from '../presents.service';

@Component({
  selector: 'app-add-technicalStuffs-dialog',
  templateUrl: './add-technicalStuffs-dialog.component.html',
  styleUrls: ['./add-technicalStuffs-dialog.component.scss']
})
export class AddtechnicalStuffsDialogComponent implements OnInit {
  public selection = new SelectionModel<any>(true, []);
  public dataSource = new MatTableDataSource([]);
  public columsDefinition = [
    {
      value: 'technicalStuff',
      label: 'technicalStuff',
    },
    {
      value: 'type',
      label: 'Typ',
    },
    {
      value: 'otherTechnicalStuffDisplay',
      label: 'otherTechnicalStuff',
    },
  ];
  public displayedColumns: string[] = [ 'select', ...this.columsDefinition.map(col => col.value), ];
  public selectedtechnicalStuffs = [];
  public isBatchLoading: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<AddtechnicalStuffsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private presentsService: PresentsService,
    private helper: HelperService,
    private dateService: DateService,
    private dialogService: DialogService,
    private userService: UserService,
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {
    this.dataSource.data = this.data.newtechnicalStuffs;

    this.selection.changed.subscribe(change => {
      this.selectedtechnicalStuffs = change.source.selected;
    });

    if (!this.isAllSelected()) {
      this.masterToggle();
    }
  }


  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  batchSavetechnicalStuffs() {
    const payload = this.createPayloadDataFromSelected(this.selectedtechnicalStuffs);
    console.warn('payload', payload);
    this.createBatchRequests(payload);
  }

  createBatchRequests(data) {
    const operationStartTime = Date.now();
    let start = 0;
    const incrementor = 10;
    const promises = [];

    this.isBatchLoading = true;
    while (start < data.length) {
      promises.push(this.presentsService.batchCreatetechnicalStuffs(data.slice(start, start + incrementor)));
      start += incrementor;
    }
    Promise.all(promises).then(value => {
      console.log('value', value);
      const operationEndTime = Date.now();
      const timeDifference = operationEndTime - operationStartTime;
      const missingTime = 800 - timeDifference;

      setTimeout(() => {
        this.dialogService.openSnackBar(`${this.selectedtechnicalStuffs.length} technicalStuff z PDF bolo pridaných`);
        // zavrie sa dialog a toto sa zavola v technicalStuffs add list: this.resetBatchData();
        this.isBatchLoading = false;
        this.dialogRef.close(true);
      }, missingTime > 0 ? missingTime : 0);

    }, reason => {
      console.log('reason', reason);
      this.dialogService.openSnackBar(`${this.selectedtechnicalStuffs.length} technicalStuff sa nepodarilo uložiť`);
      this.isBatchLoading = false;
    }).catch(error => {
      console.log('error', error);
      this.isBatchLoading = false;
      this.dialogService.openSnackBar(`Nastala chyba`);
    });
  }

  createPayloadDataFromSelected(selected) {
    return selected.map(item => {
      return {
        technicalStuff: item.technicalStuff,
        type: item.type,
        otherTechnicalStuff: item.otherTechnicalStuffValue,
        createdBy: this.helper.getEmployeeInfo(this.userService.getUser()),
        dateAdded: this.dateService.getValidDateObjectFromString(this.dateService.getCurrentDateAsString()),
        status: 'unfulfilled',
      };
    });
  }

  onNoClick(): void {
    this.selectedtechnicalStuffs = [];
    this.dialogRef.close(false);
  }

}
