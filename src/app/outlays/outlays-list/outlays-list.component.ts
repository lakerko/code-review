import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  TemplateRef,
  AfterViewInit,
  ViewContainerRef,
} from '@angular/core';

import { Subscription, BehaviorSubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatTableDataSource } from '@angular/material/table';
import { Sort } from '@angular/material/sort';

import { DataService } from 'src/app/shared/data/data.service';
import { UserService } from 'src/app/shared/services/user.service';
import { DialogService } from 'src/app/shared/services/dialog.service';
import { SelectedDataService } from 'src/app/shared/services/selected-data.service';
import { EditDontwantDialogComponent } from 'src/app/dontwants/edit-dontwant-dialog/edit-dontwant-dialog.component';
import { ConfirmDialogComponent } from 'src/app/shared/confirm-dialog/confirm-dialog.component';
import { MassEditDialogComponent } from 'src/app/shared/mass-edit-dialog/mass-edit-dialog.component';
import { HelperService } from 'src/app/shared/services/helper.service';
import { DateService } from 'src/app/shared/services/date.service';
import { otherTechnicalStuffsService } from 'src/app/shared/services/otherTechnicalStuffs.service';
import { SidenavService } from 'src/app/shared/services/sidenav.service';
import { CategoryQuery, EmployeeInfo } from 'src/app/shared/shared.model';
import { Dontwant } from '../dontwant.model';
import { DontwantsService } from '../dontwants.service';

@Component({
  selector: 'app-dontwants-list',
  templateUrl: './dontwants-list.component.html',
  styleUrls: ['./dontwants-list.component.scss']
})
export class DontwantsListComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('sidenavActionsRef') sidenavActionsRef: TemplateRef<any>;
  @ViewChild('sidenavWarehouseRef') sidenavWarehouseRef: TemplateRef<any>;

  private dontwantQuery$: BehaviorSubject<CategoryQuery>;
  private dontwants$: Subscription;

  private technicians$: Subscription;
  private displayTechnicians: any[] = [];

  public columDefinitions: any = {
    createdAt: {
      label: 'Dátum vytvorenia Dontwantia',
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
    customerName: {
      label: 'Meno',
    },
    customerPhone: {
      label: 'Tel. č.',
    },
    hsDispatchDate: {
      label: 'Dátum odoslania',
      type: 'date',
    },
    assignedTo: {
      label: 'Technik',
      type: 'select',
      isId: true,
      options: this.displayTechnicians,
    },
    note: {
      label: 'Poznámka',
    },
  };
  public displayedColumns: string[] = this.getDisplayedColumns();

  public dataSource: MatTableDataSource<any> = new MatTableDataSource([]);
  public selection: SelectionModel<any> = new SelectionModel<any>(true, []);
  public unsortedData: Dontwant[] = [];
  public selectedDontwants: Dontwant[] = [];
  public isLoading: boolean = true;

  public selectedQuery: CategoryQuery = 'opened';

  public dontwantIdsNotEligibleForDispatch = {};

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
    private dontwantsService: DontwantsService,
    private selectedDataService: SelectedDataService,
    private helper: HelperService,
    private otherTechnicalStuffsService: otherTechnicalStuffsService,
    private sidenavService: SidenavService,
    private vcr: ViewContainerRef,
    public userService: UserService,
  ) {
    this.dontwantQuery$ = new BehaviorSubject('opened');

    this.dontwants$ = this.dontwantQuery$.pipe(
      switchMap((query: CategoryQuery) => this.dontwantsService.getDontwants(query))
    ).subscribe((dontwants: Dontwant[]) => {
      this.dataSource.data = this.helper.fixTypesBasedOnotherTechnicalStuffs(dontwants);
      this.initSelection();
      this.isLoading = false;
    });
  }

  ngOnInit() {
    this.getTechnicians();

    this.selectedDataService.clearSelected$.subscribe(() => {
      this.initSelection();
      this.selectedDontwants = [];
    });

    this.setDatatableFilter();

    const mode = this.selectedDataService.getMode();
    this.isSelectionDisabled = mode !== '' && mode !== 'anonym_dontwant';
  }

  ngAfterViewInit() {
    this.sidenavService.setViewContainerRef(this.vcr);
    this.sidenavService.setPanelContent(this.sidenavActionsRef);
    this.sidenavService.setPanelContent(this.sidenavWarehouseRef, 'warehouse');
  }

  initSelection() {
    // Fil selection model with the globaly selected values
    this.selection = new SelectionModel<any>(true, this.getSelectedDataSource());
    this.selectedDontwants = this.selection.selected;

    this.selection.changed.subscribe(change => {
      this.selectedDontwants = change.source.selected;

      const selectedDontwantsIds = this.selectedDontwants.map((dontwant: Dontwant) => dontwant.id);
      for (const key of Object.keys(this.dontwantIdsNotEligibleForDispatch)) {
        if (!selectedDontwantsIds.includes(key)) {
          delete this.dontwantIdsNotEligibleForDispatch[key];
        }
      }

      this.selectedDataService.setSelectedDontwants(change.source.selected, this.selectedQuery);

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

    this.selectedDataService.getSelectedDontwants(this.selectedQuery).forEach(item => {
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
    this.dontwantQuery$.next(event.value);
  }

  createDontwant() {
    const dialogRef = this.dialog.open(EditDontwantDialogComponent, {
      width: '700px',
      data: {
        dontwantData: {},
        mode: 'create',
      },
    });
  }

  editDontwantRow(row) {
    console.warn('row', row);
    const dialogRef = this.dialog.open(EditDontwantDialogComponent, {
      width: '700px',
      data: {
        dontwantData: JSON.parse(JSON.stringify(row)),
        mode: 'edit',
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed', result);
      if (!result) {
        return;
      }
      // TODO: Prerob zo settimeoutu na subscribe na to kedy dobehne ten request
      setTimeout(() => {
        if (this.dontwantIdsNotEligibleForDispatch[row.id]) {
          const updatedRows = this.dataSource.data.filter((dontwant: Dontwant) => dontwant.id === row.id);
          if (updatedRows.length && this.isDontwantEligibleForDispatch(updatedRows[0])) {
            delete this.dontwantIdsNotEligibleForDispatch[row.id];
          }
        }
      }, 500);
    });
  }

  massEditDontwant() {
    const title = 'Skupinové zadanie dátumu odoslania';
    if (!this.areDontwantsEligibleForDispatch(this.selectedDontwants)) {
      const confirmDialogRef = this.dialogService.createDialogRef({
        component: ConfirmDialogComponent,
        width: '300px',
        data: {
          showOk: true,
          textContent: `Dontwantia nespĺňajú podmienky odoslania`,
          title,
        },
      });

      confirmDialogRef.afterClosed().subscribe(result => {
        this.selectedDontwants
          .filter((dontwant: Dontwant) => !this.isDontwantEligibleForDispatch(dontwant))
          .forEach((dontwant: Dontwant) => {
            this.dontwantIdsNotEligibleForDispatch[dontwant.id] = true;
          });

      });
      return;
    }

    const dialogRef = this.dialog.open(MassEditDialogComponent, {
      width: '400px',
      data: {
        type: 'dontwants',
        title,
        isTechnician: this.userService.getUser().isTechnician,
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        return;
      }

      this.isLoading = true;
      const documentIdsToUpdate = this.selectedDontwants.map((dontwant: Dontwant) => dontwant.id);
      Promise.all(this.dataService.batchUpdateDocuments(documentIdsToUpdate, result, 'dontwants')).then(() => {
        this.dialogService.openSnackBar(`${documentIdsToUpdate.length} Dontwantí bolo aktualizovaných`);
        this.isLoading = false;
        this.clearSelection();
      }, reason => {
        console.log('reason', reason);
        this.dialogService.openSnackBar(`Dontwantia sa nepodarilo aktualizovať`);
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
        textContent: `Naozaj si prajete skupinovo vrátiť záznamy (${this.selectedDontwants.length}) z invetúri do neuzavrených?`,
        title,
      },
    });

    confirmDialogRef.afterClosed().subscribe(result => {
      if (!result) {
        return;
      }

      this.isLoading = true;
      const updateData = { hsDispatchDate: null, dispatched: false };
      const documentIdsToUpdate = this.selectedDontwants.map((dontwant: Dontwant) => dontwant.id);
      Promise.all(this.dataService.batchUpdateDocuments(documentIdsToUpdate, updateData, 'dontwants')).then(() => {
        this.dialogService.openSnackBar(`${documentIdsToUpdate.length} Dontwantí bolo aktualizovaných`);
        this.isLoading = false;
        this.clearSelection();
      }, reason => {
        console.log('reason', reason);
        this.dialogService.openSnackBar(`Dontwantia sa nepodarilo aktualizovať`);
        this.isLoading = false;
      }).catch(error => {
        console.log('error', error);
        this.dialogService.openSnackBar(`Ajajaaaj, došlo k chybe`);
        this.isLoading = false;
      });

    });

  }

  massDeleteDontwants() {
    const confirmDialogRef = this.dialogService.createDialogRef({
      component: ConfirmDialogComponent,
      width: '300px',
      data: {
        textContent: `Naozaj si prajete hromadne zmazať záznamy (${this.selectedDontwants.length}) z Dontwantí?`,
        title: 'Hromadne zmazať záznamy z Dontwantí',
      },
    });

    confirmDialogRef.afterClosed().subscribe(result => {
      if (!result) {
        return;
      }

      this.isLoading = true;
      const documentIdsToUpdate = this.selectedDontwants.map((dontwant: Dontwant) => dontwant.id);
      Promise.all(this.dataService.batchDeleteDocuments(documentIdsToUpdate, 'dontwants')).then(() => {
        this.dialogService.openSnackBar(`${documentIdsToUpdate.length} výmien bolo vymazaných`);
        this.isLoading = false;
        this.clearSelection();
      }, reason => {
        console.log('reason', reason);
        this.dialogService.openSnackBar(`Dontwantia sa nepodarilo vymazať`);
        this.isLoading = false;
      }).catch(error => {
        console.log('error', error);
        this.dialogService.openSnackBar(`Ajajaaaj, došlo k chybe`);
        this.isLoading = false;
      });
    });
  }

  clearSelection() {
    this.selectedDontwants = [];
    this.selection.clear();
    this.selectedDataService.clearDontwants();
  }

  areDontwantsEligibleForDispatch(dontwants: Dontwant[]) {
    return dontwants.every((dontwant: Dontwant) => this.isDontwantEligibleForDispatch(dontwant));
  }

  isDontwantEligibleForDispatch(dontwant: Dontwant) {
    return (
      !!dontwant.technicalStuff &&
      !!dontwant.type &&
      !!dontwant.otherTechnicalStuff &&
      !!dontwant.customerName &&
      !!dontwant.customerPhone
    );
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

  ngOnDestroy() {
    if (this.dontwants$) {
      this.dontwants$.unsubscribe();
    }
    this.technicians$.unsubscribe();
    this.sidenavService.clearActionsPortal();
    this.sidenavService.clearWarehousePortal();
  }

}
