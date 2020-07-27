import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { HelperService } from 'src/app/shared/services/helper.service';
import { DateService } from 'src/app/shared/services/date.service';

export interface ColumnDef {
  [key: string]: {
    label: string;
    type?: 'select' | 'date';
    options?: { value: string, label: string }[];
    hide?: () => boolean;
    sortable?: boolean;
    isId?: boolean;
  };
}

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit {
  @Input()
  set data(data: any[]) {
    this.dataSource.data = data;
  }
  @Input()
  set columnDefs(def) {
    if (!def) {
      return;
    }
    this.columnsDefinition = def;
    this.displayedColumns = this.getDisplayedColumns(this.columnsDefinition);
  }
  get columnDefs() {
    return this.columnsDefinition;
  }
  @Input() selectedFilter;
  @Input()
  set selectedFromWh(kokot) {
    console.warn('kokot', kokot);
    this.picka = kokot;
  }
  @Input() targetType = 'type';
  @Input() idsNotEligibleForDispatch = [];
  @Input()
  set selectedOnInit(selected) {
    console.log('selectedOnInit', selected);
    this.initSelection(selected || []);
  }
  @Input() isLoading: boolean = true;
  @Input()
  set filterValue(value) {
    console.warn('value', value);
    this.dataSource.filter = value;
  }
  @Output() tableSelectionChange = new EventEmitter();
  @Output() editRow = new EventEmitter();
  @Output() sortChange = new EventEmitter();
  public dataSource: MatTableDataSource<any> = new MatTableDataSource([]);
  public selection: SelectionModel<any> = new SelectionModel<any>(true, []);

  public columnsDefinition = {};
  public displayedColumns: string[] = [];
  public filterByWh = '**|*filter**by**wh*|**'; // no upper case letters, because it will be sanitazied in filter
  public picka;


  constructor(
    private helper: HelperService,
    private dateService: DateService,
  ) { }

  ngOnInit(): void {
    this.setDatatableFilter();
  }

  initSelection(selected) {
    // Fil selection model with the globaly selected values
    this.selection = new SelectionModel<any>(true, this.getSelectedDataSource(selected));
    this.tableSelectionChange.emit(this.selection.selected);

    console.log('initSelection', this.selection);
    this.selection.changed.subscribe(change => {
      console.warn('change', change);
      this.tableSelectionChange.emit(change.source.selected); }
    );
  }

  /**
   * If returning to page, you want to select the globaly selected values.
   * Selection model needs datasource objects.
   * So you need to find the globaly selected values in the dataSource.data array.
   * You need the same reference.
   */
  getSelectedDataSource(selectedOnInit) {
    const selected = [];

    selectedOnInit.forEach(item => {
      const selectedRow = this.dataSource.data.find(row => row.id === item.id);
      if (selectedRow) {
        selected.push(selectedRow);
      }
    });
    return selected;
  }

  setDatatableFilter() {
    this.dataSource.filterPredicate = (row: any, filter: string) => {
      console.warn('selectedFromWh', this.picka);
      let matchFound = false;
      if (this.picka.types.length) {
        if (!this.picka.types.includes(row[this.targetType])) {
          return matchFound;
        }

        if (
          this.picka.technicianId && (!row.assignedTo || row.assignedTo && row.assignedTo.uid !== this.picka.technicianId)
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
        const isDate = this.columnsDefinition[this.selectedFilter] && this.columnsDefinition[this.selectedFilter].type === 'date';
        // check if it's id value (like technician and his uid)
        const isId = this.columnsDefinition[this.selectedFilter] && this.columnsDefinition[this.selectedFilter].isId;
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

  getDisplayedColumns(columnDefinitions): string[] {
    return [
      'actions',
      ...this.helper.getColumnsFromDefinitions(columnDefinitions)
        .filter(col => col.hide ? !col.hide() : true)
        .map(col => col.value)
    ];
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

}
