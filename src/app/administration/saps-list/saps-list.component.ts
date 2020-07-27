import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewContainerRef,
  ViewChild,
  TemplateRef,
} from '@angular/core';

import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';

import { HelperService } from 'src/app/shared/services/helper.service';
import { EditotherTechnicalStuffDialogComponent } from './edit-otherTechnicalStuff-dialog/edit-otherTechnicalStuff-dialog.component';
import { UserService } from 'src/app/shared/services/user.service';
import { SidenavService } from 'src/app/shared/services/sidenav.service';
import { otherTechnicalStuffsService } from '../../shared/services/otherTechnicalStuffs.service';
import { otherTechnicalStuffDef } from '../../shared/shared.model';

@Component({
  selector: 'app-otherTechnicalStuffs-list',
  templateUrl: './otherTechnicalStuffs-list.component.html',
  styleUrls: ['./otherTechnicalStuffs-list.component.scss']
})
export class otherTechnicalStuffsListComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('sidenavActionsRef') sidenavActionsRef: TemplateRef<any>;

  public columDefinitions: any = {
    label: {
      label: 'Zobrazeý otherTechnicalStuff - TYP',
    },
    technicalStuffs: {
      label: 'Zoznam možných technicalStuff',
    },
  };
  public displayedColumns: string[] = this.getDisplayedColumns();

  public dataSource: MatTableDataSource<any> = new MatTableDataSource([]);
  public selection: SelectionModel<any> = new SelectionModel<any>(true, []);
  public isLoading: boolean = true;

  constructor(
    private dialog: MatDialog,
    private helper: HelperService,
    private sidenavService: SidenavService,
    private vcr: ViewContainerRef,
    private otherTechnicalStuffsService: otherTechnicalStuffsService,
    public userService: UserService,
  ) { }

  ngOnInit(): void {
    this.otherTechnicalStuffsService.otherTechnicalStuffs$.subscribe((otherTechnicalStuffs: otherTechnicalStuffDef[]) => {
      this.dataSource.data = otherTechnicalStuffs;
      this.isLoading = false;
    });
  }

  ngAfterViewInit() {
    this.sidenavService.setViewContainerRef(this.vcr);
    this.sidenavService.setPanelContent(this.sidenavActionsRef);
  }

  selecttechnicalStuff(technicalStuff) {
    console.log('click', technicalStuff);
  }

  getDisplayedColumns(): string[] {
    return [
      'actions',
      ...this.helper.getColumnsFromDefinitions(this.columDefinitions)
        .filter(col => col.hide ? !col.hide() : true)
        .map(col => col.value)
    ];
  }

  createotherTechnicalStuff() {
    const dialogRef = this.dialog.open(EditotherTechnicalStuffDialogComponent, {
      width: '700px',
      data: {
        def: {},
        mode: 'create',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('The dialog was closed', result);
    });
  }

  editotherTechnicalStuffRow(row) {
    const dialogRef = this.dialog.open(EditotherTechnicalStuffDialogComponent, {
      width: '700px',
      data: {
        def: JSON.parse(JSON.stringify(row)),
        mode: 'edit',
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed', result);
      if (!result) {
        return;
      }
    });
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

  ngOnDestroy() {
    this.sidenavService.clearActionsPortal();
  }

}
