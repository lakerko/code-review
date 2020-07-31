import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { MatDialog } from '@angular/material/dialog';

import { AdministrationService } from '../../administration.service';
import { Store } from '../../administration.model';
import { CreateUserDialogComponent } from '../../create-user-dialog/create-user-dialog.component';

@Component({
  selector: 'app-stores-management',
  templateUrl: './stores-management.component.html',
  styleUrls: ['./stores-management.component.scss']
})
export class StoresManagementComponent implements OnInit {
  public stores: Store[];
  public form: FormGroup;
  public selectedStore: Store = this.getNewStore();
  public formLabel: string = 'Vytvorit predajnu';

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private administration: AdministrationService,
  ) {
  }

  ngOnInit() {
    this.administration.getStores().subscribe((stores: Store[]) => {
      this.stores = stores.map((store: Store) => {
        return {
          ...store,
          sumEmployees: store.employees ? Object.keys(store.employees).length : 0,
        };
      });
      console.warn('this.stores', this.stores);
    });

    this.form = this.fb.group({
      name: ['', [
        Validators.required,
      ]],
    });
  }

  get name() { return this.form.get('name'); }

  selectStore(store?: Store): void {
    if (!store) {
      this.selectedStore = this.getNewStore();
      this.formLabel = 'Vytvoriť predajňu';
      this.name.setValue('');
      return;
    }

    this.formLabel = `Predajňa: ${store.name}`;
    this.selectedStore = store;
    console.warn('this.selectedStore', this.selectedStore);
    this.name.setValue(store.name);

  }

  getNewStore(): Store {
    return {
      name: '',
      employees: [],
    };
  }

  addEmployee() {
    const dialogRef = this.dialog.open(CreateUserDialogComponent, {
      width: '500px',
      data: {
        store: this.selectedStore,
      },
    });

    dialogRef.afterClosed().subscribe(result => {

    });
  }

  saveStoreHandler() {

  }

}
