import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatDialog } from '@angular/material/dialog';

import { Observable } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';

import { DataService } from '../data/data.service';
import { UserService } from 'src/app/shared/services/user.service';
import { HelperService } from '../services/helper.service';
import { SelectedDataService } from '../services/selected-data.service';
import { SidenavService } from '../services/sidenav.service';
import { DialogService } from '../services/dialog.service';
import { otherTechnicalStuffsService } from '../services/otherTechnicalStuffs.service';
import { PasswordAccessDialogComponent } from './password-access-dialog/password-access-dialog.component';

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ShellComponent implements OnInit {
  private isHandset: boolean = false;
  public isHandset$: Observable<boolean> = this.breakpointObserver.observe([Breakpoints.Handset])
    .pipe(
      tap(result => this.isHandset = result.matches),
      map(result => result.matches),
      shareReplay()
    );

  public isExpanded = false;

  public routes = [];

  constructor(
    private router: Router,
    private breakpointObserver: BreakpointObserver,
    private dialog: MatDialog,
    private dataService: DataService,
    private helper: HelperService,
    private dialogService: DialogService,
    public selectedDataService: SelectedDataService,
    public userService: UserService,
    public sidenavService: SidenavService,
    public otherTechnicalStuffsService: otherTechnicalStuffsService,
    ) { }

  ngOnInit(): void {
    this.dataService.userCheck();
    this.getRoutes();
  }

  toggleExpand() {
    if (this.isHandset) {
      return;
    }
    this.isExpanded = !this.isExpanded;
  }

  logout() {
    this.dataService.logout();
  }

  copyToClipboard() {
    this.helper.copyToClipboardFromGlobalData(this.selectedDataService.getSelectedData());
  }

  clearGlobalSelection() {
    this.selectedDataService.clearSelection();
    this.dialogService.openSnackBar('Všetky položky boli odznačené');
  }

  getRoutes() {
    return this.userService.user$.subscribe(user => {
      const routesArr = [
        {
          path: '/anonym',
          label: 'Anonym',
        },
        {
          path: '/dontwats',
          label: 'Dontwantia',
        },
        {
          path: '/Present',
          label: user && user.role !== 'technician' ? 'Anonym' : 'Present',
        },
        // {
        //   path: '/reklamacie',
        //   label: 'Reklamácie',
        // },
      ];

      this.routes = routesArr;
    });
  }

  goToAdministration() {
    const dialogRef = this.dialog.open(PasswordAccessDialogComponent, {
      width: '350px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('The dialog was closed', result);
      if (result) {
        this.router.navigate(['/administracia']);
      }
    });
  }

}
