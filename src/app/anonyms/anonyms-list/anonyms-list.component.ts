import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  AfterViewInit,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';

import { BehaviorSubject, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { MatDialog } from '@angular/material/dialog';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { SelectionModel } from '@angular/cdk/collections';

import { AnonymsService } from '../anonyms.service';
import { DataService } from 'src/app/shared/data/data.service';
import { UserService } from 'src/app/shared/services/user.service';
import { DialogService } from 'src/app/shared/services/dialog.service';
import { SelectedDataService } from 'src/app/shared/services/selected-data.service';
import { HelperService } from 'src/app/shared/services/helper.service';
import { DateService } from 'src/app/shared/services/date.service';
import { otherTechnicalStuffsService } from 'src/app/shared/services/otherTechnicalStuffs.service';
import { SidenavService } from '../../shared/services/sidenav.service';
import { MassEditDialogComponent } from 'src/app/shared/mass-edit-dialog/mass-edit-dialog.component';
import { ConfirmDialogComponent } from 'src/app/shared/confirm-dialog/confirm-dialog.component';
import { EditAnonymDialogComponent } from '../edit-anonym-dialog/edit-anonym-dialog.component';
import { CategoryQuery, EmployeeInfo } from 'src/app/shared/shared.model';
import { Anonym } from '../anonym.model';

@Component({
  selector: 'app-anonyms-list',
  templateUrl: './anonyms-list.component.html',
  styleUrls: ['./anonyms-list.component.scss']
})
export class AnonymsListComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('sidenavActionsRef') sidenavActionsRef: TemplateRef<any>;
  @ViewChild('sidenavWarehouseRef') sidenavWarehouseRef: TemplateRef<any>;

  private anonymQuery$: BehaviorSubject<CategoryQuery>;
  private anonyms$: Subscription;

  private technicians$: Subscription;
  private displayTechnicians: any[] = [];

  public selectedQuery: CategoryQuery = 'opened';

  public columDefinitions: any = {
    createdAt: {
      label: 'Dátum vytvorenia výmeny',
      type: 'date',
      // sortable: true, FOR UNIVERSAL TABLE
    },
    technicalStuff: {
      label: 'technicalStuff od zákazníka',
    },
    typeAnonym: {
      label: 'Typ od zákazníka',
      type: 'select',
      options: this.otherTechnicalStuffsService.getTypes().map(opt => ({ value: opt, label: opt, })),
    },
    technicalStuff2: {
      label: 'technicalStuff zo Presentu'
    },
    type: {
      label: 'Typ zo Presentu',
      type: 'select',
      // TODO: types are now dynamic, they can be changed at any time, what to do about
      options: this.otherTechnicalStuffsService.getTypes().map(opt => ({ value: opt, label: opt, })),
    },
    customerName: {
      label: 'Meno',
      // sortable: true, FOR UNIVERSAL TABLE
    },
    customerPhone: {
      label: 'Tel. č.',
    },
    hsDispatchDate: {
      label: 'Dátum odoslania',
      type: 'date',
      hide: () => this.selectedQuery !== 'inventory',
      // sortable: true, FOR UNIVERSAL TABLE
    },
    assignedTo: {
      label: 'Technik',
      type: 'select',
      isId: true,
      options: this.displayTechnicians,
      // sortable: true, FOR UNIVERSAL TABLE
    },
    sp: {
      label: 'Servisná požiadavka',
    },
    note: {
      label: 'Poznámka',
    },
  };
  public displayedColumns: string[] = this.getDisplayedColumns();

  public dataSource: MatTableDataSource<any> = new MatTableDataSource([]);
  public selection: SelectionModel<any> = new SelectionModel<any>(true, []);
  public unsortedData: Anonym[] = [];
  public selectedAnonyms: Anonym[] = [];
  public isLoading: boolean = true;

  public anonymIdsNotEligibleForDispatch = {};

  public selectedFilter: string;

  public selectedFromWh: { types: string[], technicianId: string } = {
    types: [],
    technicianId: undefined,
  };
  private currentUserFilter;
  public filterByWh = '**|*filter**by**wh*|**'; // no upper case letters, because it will be sanitazied in filter

  // public selectedOnInit; FOR UNIVERSAL TABLE

  public isSelectionDisabled: boolean = true;

  constructor(
    private dialog: MatDialog,
    private dialogService: DialogService,
    private dateService: DateService,
    private dataService: DataService,
    private anonymsService: AnonymsService,
    private selectedDataService: SelectedDataService,
    private helper: HelperService,
    private otherTechnicalStuffsService: otherTechnicalStuffsService,
    private sidenavService: SidenavService,
    private vcr: ViewContainerRef,
    public userService: UserService,
  ) {
    this.anonymQuery$ = new BehaviorSubject('opened');

    this.anonyms$ = this.anonymQuery$.pipe(
      switchMap((query: CategoryQuery) => this.anonymsService.getAnonyms(query))
    ).subscribe(anonyms => {
      this.displayedColumns = this.getDisplayedColumns();
      this.dataSource.data = this.helper.fixTypesBasedOnotherTechnicalStuffs(anonyms);
      this.initSelection();
      this.isLoading = false;
    });

    this.selectedDataService.clearSelected$.subscribe(() => {
      this.initSelection();
      this.selectedAnonyms = [];
    });
  }

  ngOnInit() {
    this.getTechnicians();

    this.setDatatableFilter();

    const mode = this.selectedDataService.getMode();
    this.isSelectionDisabled = mode !== '' && mode !== 'anonym_dontwant';
  }

  ngAfterViewInit() {
    this.sidenavService.setViewContainerRef(this.vcr);
    this.sidenavService.setPanelContent(this.sidenavActionsRef, 'actions');
    this.sidenavService.setPanelContent(this.sidenavWarehouseRef, 'warehouse');
  }

  initSelection() {
    // Fil selection model with the globaly selected values
    this.selection = new SelectionModel<any>(true, this.getSelectedDataSource());
    this.selectedAnonyms = this.selection.selected;
    // this.selectedOnInit = [ ...this.selectedDataService.getSelectedAnonyms(this.selectedQuery) ]; FOR UNIVERSAL TABLE

    this.selection.changed.subscribe(change => {
      this.selectedAnonyms = change.source.selected;

      const selectedAnonymsIds = this.selectedAnonyms.map((anonym: Anonym) => anonym.id);
      for (const key of Object.keys(this.anonymIdsNotEligibleForDispatch)) {
        if (!selectedAnonymsIds.includes(key)) {
          delete this.anonymIdsNotEligibleForDispatch[key];
        }
      }

      this.selectedDataService.setSelectedAnonyms(change.source.selected, this.selectedQuery);
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

    this.selectedDataService.getSelectedAnonyms(this.selectedQuery).forEach(item => {
      const selectedRow = this.dataSource.data.find(row => row.id === item.id);
      if (selectedRow) {
        selected.push(selectedRow);
      }
    });
    return selected;
  }

  setDatatableFilter() {
    this.dataSource.filterPredicate = (row: Anonym, filter: string) => {
      let matchFound = false;
      if (this.selectedFromWh.types.length) {
        if (!this.selectedFromWh.types.includes(row.typeAnonym)) {
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

  getDisplayedColumns(): string[] {
    return [
      'actions',
      ...this.helper.getColumnsFromDefinitions(this.columDefinitions)
        .filter(col => col.hide ? !col.hide() : true)
        .map(col => col.value)
    ];
  }

  onSelectFilter(event: MatButtonToggleChange) {
    this.selectedQuery = event.value;
    this.isLoading = true;
    this.anonymQuery$.next(event.value);
  }

  editAnonymRow(row): void {
    console.warn('row', row);
    const dialogRef = this.dialog.open(EditAnonymDialogComponent, {
      width: '700px',
      data: {
        anonymData: this.getSafeRowObj(row),
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed', result);
      if (!result) {
        return;
      }
      // TODO: Refactor from set timeout to request subscription
      setTimeout(() => {
        if (this.anonymIdsNotEligibleForDispatch[row.id]) {
          const updatedRows = this.dataSource.data.filter((anonym: Anonym) => anonym.id === row.id);
          if (updatedRows.length && this.isAnonymEligibleForDispatch(updatedRows[0])) {
            delete this.anonymIdsNotEligibleForDispatch[row.id];
          }
        }
      }, 500);
    });
  }

  massEditAnonym() {
    const title = 'Skupinové zadanie dátumu odoslania';
    if (!this.areAnonymsEligibleForDispatch(this.selectedAnonyms)) {
      const confirmDialogRef = this.dialogService.createDialogRef({
        component: ConfirmDialogComponent,
        width: '300px',
        data: {
          showOk: true,
          textContent: `Výmeny nespĺňajú podmienky odoslania`,
          title,
        },
      });

      confirmDialogRef.afterClosed().subscribe(result => {
        this.selectedAnonyms
          .filter((anonym: Anonym) => !this.isAnonymEligibleForDispatch(anonym))
          .forEach((anonym: Anonym) => {
            this.anonymIdsNotEligibleForDispatch[anonym.id] = true;
          });

      });
      return;
    }

    const dialogRef = this.dialog.open(MassEditDialogComponent, {
      width: '400px',
      data: {
        type: 'anonyms',
        title,
        isTechnician: this.userService.getUser().isTechnician,
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        return;
      }

      this.isLoading = true;
      const documentIdsToUpdate = this.selectedAnonyms.map((anonym: Anonym) => anonym.id);
      Promise.all(this.dataService.batchUpdateDocuments(documentIdsToUpdate, result, 'anonyms')).then(() => {
        this.dialogService.openSnackBar(`${documentIdsToUpdate.length} výmien bolo aktualizovaných`);
        this.isLoading = false;
        this.clearSelection();
      }, reason => {
        console.log('reason', reason);
        this.dialogService.openSnackBar(`Výmeny sa nepodarilo aktualizovať`);
        this.isLoading = false;
      }).catch(error => {
        console.log('error', error);
        this.dialogService.openSnackBar(`Ajajaaaj, došlo k chybe`);
        this.isLoading = false;
      });

    });
  }

  massRemoveDispatched() {
    const title = 'Skupinové vrátenie z invetúri do neuzavrených';

    const confirmDialogRef = this.dialogService.createDialogRef({
      component: ConfirmDialogComponent,
      width: '300px',
      data: {
        textContent: `Naozaj si prajete skupinovo vrátiť záznamy (${this.selectedAnonyms.length}) z invetúri do neuzavrených?`,
        title,
      },
    });

    confirmDialogRef.afterClosed().subscribe(result => {
      if (!result) {
        return;
      }

      this.isLoading = true;
      const documentIdsToUpdate = this.selectedAnonyms.map((anonym: Anonym) => anonym.id);
      const updateData = { hsDispatchDate: null, dispatched: false };
      Promise.all(this.dataService.batchUpdateDocuments(documentIdsToUpdate, updateData, 'anonyms')).then(() => {
        this.dialogService.openSnackBar(`${documentIdsToUpdate.length} výmien bolo aktualizovaných`);
        this.isLoading = false;
        this.clearSelection();
      }, reason => {
        console.log('reason', reason);
        this.dialogService.openSnackBar(`Výmeny sa nepodarilo aktualizovať`);
        this.isLoading = false;
      }).catch(error => {
        console.log('error', error);
        this.dialogService.openSnackBar(`Ajajaaaj, došlo k chybe`);
        this.isLoading = false;
      });

    });

  }

  massDeleteAnonyms() {
    const confirmDialogRef = this.dialogService.createDialogRef({
      component: ConfirmDialogComponent,
      width: '300px',
      data: {
        textContent: `Naozaj si prajete hromadne zmazať záznamy (${this.selectedAnonyms.length}) z výmien?`,
        title: 'Hromadne zmazať záznamy z výmien',
      },
    });

    confirmDialogRef.afterClosed().subscribe(result => {
      if (!result) {
        return;
      }

      this.isLoading = true;
      const documentIdsToUpdate = this.selectedAnonyms.map((anonym: Anonym) => anonym.id);
      this.anonymsService.massDeleteAnonyms(documentIdsToUpdate).then(() => {
        this.dialogService.openSnackBar(`${documentIdsToUpdate.length} výmien bolo vymazaných a ich pôvodné technicalStuff boli vrátené do Presentu`);
        this.isLoading = false;
        this.clearSelection();
      }, reason => {
        console.log('reason', reason);
        this.dialogService.openSnackBar(`Výmeny sa nepodarilo vymazať`);
        this.isLoading = false;
      }).catch(error => {
        console.log('error', error);
        this.dialogService.openSnackBar(`Ajajaaaj, došlo k chybe`);
        this.isLoading = false;
      });
    });
  }

  clearSelection() {
    this.selectedAnonyms = [];
    this.selection.clear();
    this.selectedDataService.clearAnonyms();
  }

  areAnonymsEligibleForDispatch(anonyms: Anonym[]) {
    return anonyms.every((anonym: Anonym) => this.isAnonymEligibleForDispatch(anonym));
  }

  isAnonymEligibleForDispatch(anonym: Anonym) {
    const regex = RegExp('^\\d{7}|-$');
    return (
      !!anonym.technicalStuff &&
      !!anonym.otherTechnicalStuffAnonym &&
      !!anonym.type &&
      !!anonym.technicalStuff2 &&
      !!anonym.otherTechnicalStuff &&
      !!anonym.customerName &&
      !!anonym.customerPhone &&
      regex.test(anonym.sp)
    );
  }

  getSafeRowObj(row) {
    const safeRowData = {};
    for (const key of Object.keys(row)) {
      if (key !== 'technicalStuffRef' && key !== 'relationships') {
        safeRowData[key] = row[key];
      }
    }

    return {
      ...JSON.parse(JSON.stringify(safeRowData)),
      technicalStuffRef: row.technicalStuffRef,
      relationships: row.relationships,
    };
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

  // FOR UNIVERSAL TABLE
  // tableSelectionChange(change) {
  //   const selectedIds = change.map(selected => selected.id);
  //   for (const key of Object.keys(this.anonymIdsNotEligibleForDispatch)) {
  //     if (!selectedIds.includes(key)) {
  //       delete this.anonymIdsNotEligibleForDispatch[key];
  //     }
  //   }
  //   this.selectedDataService.setSelectedAnonyms(change, this.selectedQuery);
  // }

  ngOnDestroy() {
    this.anonyms$.unsubscribe();
    this.technicians$.unsubscribe();
    this.sidenavService.clearActionsPortal();
    this.sidenavService.clearWarehousePortal();
  }

}
