import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  TemplateRef,
  AfterViewInit,
  ViewContainerRef,
} from '@angular/core';
import { Subscription } from 'rxjs';

import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { DataService } from 'src/app/shared/data/data.service';
import { UserService } from 'src/app/shared/services/user.service';
import { DialogService } from 'src/app/shared/services/dialog.service';
import { EdittechnicalStuffDialogComponent } from 'src/app/presents/edit-technicalStuff-dialog/edit-technicalStuff-dialog.component';
import { MassEditDialogComponent } from 'src/app/shared/mass-edit-dialog/mass-edit-dialog.component';
import { HelperService } from 'src/app/shared/services/helper.service';
import { SelectedDataService } from 'src/app/shared/services/selected-data.service';
import { DateService } from 'src/app/shared/services/date.service';
import { otherTechnicalStuffsService } from 'src/app/shared/services/otherTechnicalStuffs.service';
import { SidenavService } from 'src/app/shared/services/sidenav.service';
import { ExtractPdfDialogComponent } from '../pdf/extract-pdf-dialog/extract-pdf-dialog.component';
import { PresentsService } from '../presents.service';
import { technicalStuff } from '../present.model';
import { EmployeeInfo } from 'src/app/shared/shared.model';
import { ConfirmDialogComponent } from 'src/app/shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-presents-list',
  templateUrl: './presents-list.component.html',
  styleUrls: ['./presents-list.component.scss']
})
export class PresentsListComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('sidenavActionsRef') sidenavActionsRef: TemplateRef<any>;
  @ViewChild('sidenavWarehouseRef') sidenavWarehouseRef: TemplateRef<any>;

  private unfulfilledChanges$: Subscription;

  private technicians$: Subscription;
  private displayTechnicians: any[] = [];

  public isLoading: boolean = true;
  public selectedtechnicalStuffs: technicalStuff[] = [];

  public columDefinitions = {
    dateAdded: {
      label: 'Dátum pridania',
      type: 'date',
    },
    technicalStuff: {
      label: 'technicalStuff',
    },
    type: {
      label: 'Typ',
      type: 'select',
      options: this.otherTechnicalStuffsService.getTypes().map(opt => ({ value: opt, label: opt, })),
    },
    createdBy: {
      label: 'Vytvoril',
    },
    assignedTo: {
      label: 'Technik',
      type: 'select',
      isId: true,
      options: this.displayTechnicians,
    },
  };
  public displayedColumns: string[] = this.getDisplayedColumns();

  public dataSource: MatTableDataSource<any> = new MatTableDataSource([]);
  public selection: SelectionModel<any> = new SelectionModel<any>(true, []);
  public unsortedData: technicalStuff[] = [];

  public selectedFilter: string;

  private selectedFromWh: { types: string[], technicianId: string } = {
    types: [],
    technicianId: undefined,
  };
  private currentUserFilter;
  private filterByWh = '**|*filter**by**wh*|**'; // no upper case letters, because it will be sanitazied in filter

  public isSelectionDisabled: boolean = true;

  constructor(
    private dialog: MatDialog,
    private dialogService: DialogService,
    private dateService: DateService,
    private dataService: DataService,
    private presentsService: PresentsService,
    private helper: HelperService,
    private selectedDataService: SelectedDataService,
    private otherTechnicalStuffsService: otherTechnicalStuffsService,
    private sidenavService: SidenavService,
    private vcr: ViewContainerRef,
    public userService: UserService,
  ) {
  }

  ngOnInit() {
    this.getTechnicians();

    this.unfulfilledChanges$ = this.presentsService.getUnfulfilledtechnicalStuffs().subscribe((unfulfilledtechnicalStuffs: technicalStuff[]) => {
      this.dataSource.data = this.helper.fixTypesBasedOnotherTechnicalStuffs(unfulfilledtechnicalStuffs);
      this.initSelection();
      this.isLoading = false;
    });

    this.selectedDataService.clearSelected$.subscribe(() => {
      this.initSelection();
      this.selectedtechnicalStuffs = [];
    });

    // this.dataSource.sort = this.sort;
    this.setDatatableFilter();

    const mode = this.selectedDataService.getMode();
    this.isSelectionDisabled = mode !== '' && mode !== 'present';
  }

  ngAfterViewInit() {
    this.sidenavService.setViewContainerRef(this.vcr);
    this.sidenavService.setPanelContent(this.sidenavActionsRef);
    this.sidenavService.setPanelContent(this.sidenavWarehouseRef, 'warehouse');
  }

  initSelection() {
    // Fil selection model with the globaly selected values
    this.selection = new SelectionModel<any>(true, this.getSelectedDataSource());

    this.selection.changed.subscribe(change => {
      this.selectedtechnicalStuffs = change.source.selected;
      this.selectedDataService.setSelectedPresents(change.source.selected);
    });
  }

  /**
   * If returning to page, you want to select the globaly selected values.
   * Selection model needs datasource objects.
   * So you need to find the globaly selected values in the dataSource.data array.
   * You need the same reference.
   */
  getSelectedDataSource() {
    const selected = [];

    this.selectedDataService.getSelectedPresents().forEach(item => {
      const selectedRow = this.dataSource.data.find(row => row.id === item.id);
      if (selectedRow) {
        selected.push(selectedRow);
      }
    });

    return selected;
  }

  setDatatableFilter() {
    this.dataSource.filterPredicate = (row: any, filter: string) => {
      let matchFound = false;
      if (this.selectedFromWh.types.length) {
        if (!this.selectedFromWh.types.includes(row.type)) {
          return matchFound;
        }

        if (
          this.selectedFromWh.technicianId && (!row.assignedTo || row.assignedTo && row.assignedTo.uid !== this.selectedFromWh.technicianId)
        ) {
          return matchFound;
        }
      }
      // when filtering only by WH types, which is the case when this condition is true,
      // we have no need to check any futher, because it's a match
      if (filter === this.filterByWh) {
        return true;
      }
      // if user selected filter type, we search only in selected column
      if (this.selectedFilter) {
        // look into column definition, if selected column is if type date, we will later convert it from date value to string
        const isDate = this.columDefinitions[this.selectedFilter] && this.columDefinitions[this.selectedFilter].type === 'date';
        // check if it's id value (like technician and his uid)
        const isId = this.columDefinitions[this.selectedFilter] && this.columDefinitions[this.selectedFilter].isId;
        // return corect value based on the selected type
        const columnValue = isDate
          ? row[this.selectedFilter] ? this.dateService.getValidDateStringFormatFromDate(row[this.selectedFilter]) : ''
          : row[this.selectedFilter] && isId
            ? row[this.selectedFilter].uid ? row[this.selectedFilter].uid : ''
            : (row[this.selectedFilter] ? row[this.selectedFilter] : '').toString().trim().toLowerCase();
        const filterValue = isId
          ? filter
          : (isDate ? this.dateService.getPartialValidDateFormatFromString(filter) : filter.trim().toLowerCase());

        matchFound = (matchFound || columnValue.indexOf(filterValue) !== -1);
      } else {
        for (const column of this.displayedColumns) {
          if (column in row && row[column]) {
            const isDate = this.helper.isDateColumn(column);
            const columnValue = isDate
              ? this.dateService.getValidDateStringFormatFromDate(row[column])
              : row[column].toString().trim().toLowerCase();
            const filterValue = isDate
              ? this.dateService.getPartialValidDateFormatFromString(filter)
              : filter.trim().toLowerCase();

            matchFound = (matchFound || columnValue.indexOf(filterValue) !== -1);
          }
        }
      }

      return matchFound;
    };
  }

  createtechnicalStuff() {
    const dialogRef = this.dialog.open(EdittechnicalStuffDialogComponent, {
      width: '700px',
      data: {
        technicalStuffData: {},
        mode: 'create',
      },
    });

    dialogRef.afterClosed().subscribe((result: technicalStuff) => {
      console.log('The dialog was closed', result);
    });
  }

  getDisplayedColumns(): string[] {
    return [
      'actions',
      ...this.helper.getColumnsFromDefinitions(this.columDefinitions)
        .filter(col => col.hide ? !col.hide() : true)
        .map(col => col.value)
    ];
  }

  edittechnicalStuffRow(row) {
    console.warn('row', JSON.parse(JSON.stringify(row)));
    const dialogRef = this.dialog.open(EdittechnicalStuffDialogComponent, {
      width: '700px',
      data: {
        technicalStuffData: JSON.parse(JSON.stringify(row)),
        mode: 'edit',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('The dialog was closed', result);
    });
  }

  massEdittechnicalStuffs() {
    const dialogRef = this.dialog.open(MassEditDialogComponent, {
      width: '400px',
      data: {
        title: 'Skupinové pridelenie technika',
        type: 'unfulfilled',
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        return;
      }
      console.warn('result', result);
      console.log('this.selectedtechnicalStuffs', this.selectedtechnicalStuffs);
      this.isLoading = true;
      const documentIdsToUpdate = this.selectedtechnicalStuffs.map((technicalStuff: technicalStuff) => technicalStuff.id);
      Promise.all(this.dataService.batchUpdateDocuments(documentIdsToUpdate, result, 'technicalStuffs')).then(() => {
        this.dialogService.openSnackBar(`${documentIdsToUpdate.length} technicalStuff bolo aktualizovaných`);
        this.isLoading = false;
        this.clearSelection();
        console.log('this.selectedtechnicalStuffs', this.selectedtechnicalStuffs);
      }, reason => {
        console.log('reason', reason);
        this.dialogService.openSnackBar(`technicalStuff sa nepodarilo aktualizovať`);
        this.isLoading = false;
      }).catch(error => {
        console.log('error', error);
        this.dialogService.openSnackBar(`Ajajaaaj, došlo k chybe`);
        this.isLoading = false;
      });

    });
  }

  massDeletetechnicalStuffs() {
    const confirmDialogRef = this.dialogService.createDialogRef({
      component: ConfirmDialogComponent,
      width: '300px',
      data: {
        textContent: `Naozaj si prajete hromadne zmazať záznamy (${this.selectedtechnicalStuffs.length}) z present?`,
        title: 'Hromadne zmazať záznamy z present',
      },
    });

    confirmDialogRef.afterClosed().subscribe(result => {
      if (!result) {
        return;
      }

      this.isLoading = true;
      const documentIdsToUpdate = this.selectedtechnicalStuffs.map((technicalStuff: technicalStuff) => technicalStuff.id);
      Promise.all(this.dataService.batchDeleteDocuments(documentIdsToUpdate, 'technicalStuffs')).then(() => {
        this.dialogService.openSnackBar(`${documentIdsToUpdate.length} technicalStuff bolo vymazaných`);
        this.isLoading = false;
        this.clearSelection();
      }, reason => {
        console.log('reason', reason);
        this.dialogService.openSnackBar(`technicalStuff sa nepodarilo vymazať`);
        this.isLoading = false;
      }).catch(error => {
        console.log('error', error);
        this.dialogService.openSnackBar(`Ajajaaaj, došlo k chybe`);
        this.isLoading = false;
      });
    });
  }

  clearSelection() {
    this.selectedtechnicalStuffs = [];
    this.selection.clear();
    this.selectedDataService.clearPresents();
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
    console.warn('this.selection', this.selection);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  onSortData(sort: Sort) {
    if (sort.direction === 'asc') {
      this.unsortedData = this.dataSource.data.slice();
    } else if (!sort.direction) {
      this.dataSource.data = this.unsortedData;
      return;
    }

    if (!sort.active) {
      return;
    }

    this.dataSource.data = this.helper.sortTableData(this.dataSource.data.slice(), sort);
  }

  onWhSelectChange(change: { types: string[], technicianId: string }) {
    this.selectedFromWh = change;
    this.applyWhFilter();
  }

  applyWhFilter() {
    const isActiveWhFilter = this.selectedFromWh && this.selectedFromWh.types && !!this.selectedFromWh.types.length;
    // if there are user filters active, use them, otherwise if there are WH filters selected, use those
    this.applyFilter(this.currentUserFilter ? this.currentUserFilter : (isActiveWhFilter ? this.filterByWh : ''));
  }

  onFilterChange({filterBy, filterValue}) {
    this.selectedFilter = filterBy;
    this.applyFilter(filterValue);
  }

  applyFilter(filterValue: string) {
    // we dont want the special filterWh value to be logged as user filter
    if (filterValue !== this.filterByWh) {
      this.currentUserFilter = filterValue;
    }
    const selectedColDef = this.columDefinitions[this.selectedFilter];
    // if the value is of type Id, we don't want to manipulate the string in any way
    const shouldPreserveValue = selectedColDef && selectedColDef.isId;
    this.dataSource.filter = filterValue
      ? shouldPreserveValue ? filterValue : filterValue.trim().toLowerCase()
      : '';

    if (!filterValue && this.selectedFromWh.types && this.selectedFromWh.types.length) {
      this.applyWhFilter();
    }
  }

  getTechnicians() {
    this.technicians$ = this.dataService.getTechnicians().subscribe((technicians: EmployeeInfo[]) => {
      this.displayTechnicians = this.helper
        .getTechniciansWithEmptyOption(technicians)
        .map(technician => ({
          value: technician.uid,
          label: technician.displayName,
        }));
      if (this.columDefinitions && this.columDefinitions.assignedTo) {
        this.columDefinitions.assignedTo.options = this.displayTechnicians;
      }
    });
  }

  openPdfExtractor() {
    const dialogRef = this.dialog.open(ExtractPdfDialogComponent, {
      width: '700px',
    });

    dialogRef.afterClosed().subscribe((result: technicalStuff) => {
      console.log('The dialog was closed', result);
    });
  }

  ngOnDestroy() {
    this.unfulfilledChanges$.unsubscribe();
    this.technicians$.unsubscribe();
    this.sidenavService.clearActionsPortal();
    this.sidenavService.clearWarehousePortal();
  }

}
