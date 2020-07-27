import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';

import { Subscription } from 'rxjs';

import { SelectionModel } from '@angular/cdk/collections';

import { DataService } from 'src/app/shared/data/data.service';
import { HelperService } from '../services/helper.service';
import { UserService } from 'src/app/shared/services/user.service';
import { technicalStuff } from 'src/app/presents/present.model';
import { Anonym } from 'src/app/anonyms/anonym.model';
import { Dontwant } from 'src/app/dontwants/dontwant.model';
import { EmployeeInfo } from '../shared.model';

@Component({
  selector: 'app-warehouse-state-indicator',
  templateUrl: './warehouse-state-indicator.component.html',
  styleUrls: ['./warehouse-state-indicator.component.scss']
})
export class WarehouseStateIndicatorComponent implements OnInit {
  @Input()
  set data(data: (technicalStuff | Anonym | Dontwant)[]) {
    this.currentData = data;
    this.displayState = this.calculateState(this.currentData);
    // console.log('this.currentData', this.currentData);
  }
  get data(): (technicalStuff | Anonym | Dontwant)[] {
    return this.currentData || [];
  }

  @Input()
  set filteredData(filteredData: (technicalStuff | Anonym | Dontwant)[]) {
    this.displayState = this.calculateState(this.currentData, filteredData);
    this.displayAll = this.displayState
      .map(item => item.filtered)
      .reduce((accum, current) => accum += current, 0);
    // console.log('ficlka', this.displayState, filteredData);
    // console.log('this.currentData', this.currentData);
  }

  @Input() target: 'type' | 'typeAnonym' = 'type';
  @Output() selectChange = new EventEmitter();

  private currentData: (technicalStuff | Anonym | Dontwant)[] = [];
  private selectedTechnicianId: string;
  private selectedTypes: string[] = [];
  private technicians$: Subscription;
  public displayTechnicians: EmployeeInfo[] = [];
  public filterForm: FormGroup;
  public displayState: { label: string, all: number, filtered: number}[] = [];
  public displayAll: number = 0;
  public selection: SelectionModel<any> = new SelectionModel<any>(true, []);

  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    private helper: HelperService,
    public userService: UserService,
  ) { }

  ngOnInit() {
    this.userService.user$.subscribe(user => {
      if (user && user.isTechnician) {
        this.selectedTechnicianId = user.uid;
      }
    });

    this.filterForm = this.fb.group({
      filterByPerson: [ '' ],
    });
    this.filterForm.get('filterByPerson').valueChanges.subscribe((technicianId: string) => {
      this.selectedTechnicianId = technicianId;
      this.displayState = this.calculateState(this.currentData);
      this.emitChange();
    });
    this.getTechnicians();

    this.selection.changed.subscribe(change => {
      this.selectedTypes = change.source.selected;
      this.emitChange();
    });
  }

  getTechnicians() {
    this.technicians$ = this.dataService.getTechnicians().subscribe((technicians: EmployeeInfo[]) => {
      this.displayTechnicians = this.helper.getTechniciansWithEmptyOption(technicians, 'Všetci');
    });
  }

  calculateState(data, filtered = []): { label: string, all: number, filtered: number}[] {
    const filterBySelectedTechnician = data.filter(item =>
      this.selectedTechnicianId ? item && item.assignedTo && item.assignedTo.uid === this.selectedTechnicianId : true
    );

    const state = this.helper.fixValues(filterBySelectedTechnician, this.target);
    const filteredState = this.helper.fixValues(filtered, this.target);
    return Object.keys(state).map(key => {
      const sumFiltered = filteredState[this.target];
      const sumAll = state[key];
      return {
        label: key,
        all: state[key],
        filtered: sumFiltered <= sumAll ? sumFiltered : sumAll,
      };
    }).sort((a, b) => a.label.localeCompare(b.label));
  }

  emitChange() {
    this.selectChange.next({
      types: this.selectedTypes || [],
      technicianId: this.selectedTechnicianId,
    });
  }

}
