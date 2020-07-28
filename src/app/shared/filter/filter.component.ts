import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { merge } from 'rxjs';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit {
  @Input() columDefinitions;
  @Output() filterChange = new EventEmitter();

  public form: FormGroup;
  public selectedFilter: string;
  public isOfTypeSelect: boolean;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      filterBy: [ '' ],
      filterSelect: [ '' ],
      filterInput: [ '' ],
    });

    this.filterBy.valueChanges.subscribe(filterBy => {
      this.isOfTypeSelect = this.columDefinitions[filterBy] && this.columDefinitions[filterBy].type === 'select';
      if (this.isOfTypeSelect) {
        this.filterSelect.setValue('');
      } else {
        this.filterInput.setValue('');
      }
    });

    merge(
      this.filterSelect.valueChanges,
      this.filterInput.valueChanges
    ).subscribe(filterValue =>
      this.filterChange.emit({
        filterBy: this.filterBy.value,
        filterValue,
      })
    );
  }

  get filterBy() { return this.form.get('filterBy'); }
  get filterSelect() { return this.form.get('filterSelect'); }
  get filterInput() { return this.form.get('filterInput'); }

}
