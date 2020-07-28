import { Component, OnInit, Input, forwardRef, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ControlValueAccessor,
  Validator,
  AbstractControl,
  ValidationErrors,
  NG_VALUE_ACCESSOR,
  NG_VALIDATORS,
  Validators,
} from '@angular/forms';

import { Subscription, BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { startWith, tap } from 'rxjs/operators';

import { otherTechnicalStuffsService } from '../services/otherTechnicalStuffs.service';
import { DictionaryService } from '../services/dictionary.service';
import { User, SelectOption } from '../shared.model';
import { technicalStuff } from 'src/app/presents/present.model';
import { PresentsService } from '../../presents/presents.service';

export interface technicalStuffForm {
  technicalStuff: {
    value: string;
    disabled: boolean;
  };
  type: {
    value: string;
    disabled: boolean;
  };
  otherTechnicalStuff: {
    value: string;
    disabled: boolean;
  };
}


@Component({
  selector: 'app-select-technicalStuff-form-group',
  templateUrl: './select-technicalStuff-form-group.component.html',
  styleUrls: ['./select-technicalStuff-form-group.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelecttechnicalStuffFormGroupComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => SelecttechnicalStuffFormGroupComponent),
      multi: true,
    },
  ],
})
export class SelecttechnicalStuffFormGroupComponent implements OnInit, OnDestroy, ControlValueAccessor, Validator {
  @Input() initialValues: technicalStuffForm;
  @Input() user: User;
  @Input() addendum: string = '';

  private technicalStuffChanges$: Subscription;
  private otherTechnicalStuffChanges$: Subscription;
  private availableotherTechnicalStuffOptions$: BehaviorSubject<SelectOption[]>;
  private technicalStuffs = this.otherTechnicalStuffsService.gettechnicalStuffs();
  private types = this.otherTechnicalStuffsService.getTypes();
  private otherTechnicalStuffs = this.otherTechnicalStuffsService.getotherTechnicalStuffsAsOptions();
  private technicalStuffsAndotherTechnicalStuffs = this.otherTechnicalStuffsService.gettechnicalStuffsAndotherTechnicalStuffs();
  public filteredTypesOptions = this.types;
  public filteredotherTechnicalStuffOptions: SelectOption[];

  public technicalStuffForm: FormGroup;

  public correspondingtechnicalStuffDisplayOptions: string[] = [];
  public availableSecondarytechnicalStuffs: technicalStuff[] = [];

  constructor(
    private fb: FormBuilder,
    private otherTechnicalStuffsService: otherTechnicalStuffsService,
    private presentsService: PresentsService,
    public dictionary: DictionaryService,
  ) { }

  ngOnInit() {
    this.technicalStuffForm  = this.fb.group({
      technicalStuff: [
        null,
        [ Validators.required ]
      ],
      type: [
        null,
        [ Validators.required ]
      ],
      otherTechnicalStuff: [
        null,
        [ Validators.required ]
      ],
      id: [ null ],
    });

    this.availableotherTechnicalStuffOptions$ = new BehaviorSubject(this.otherTechnicalStuffs);
    this.setupListenerFortechnicalStuff();
    this.setupListenerForotherTechnicalStuffAndType();

    this.presentsService.getAvailableSecondarytechnicalStuffs().subscribe(technicalStuffs => {
      this.availableSecondarytechnicalStuffs = technicalStuffs as technicalStuff[];
      console.warn('this.availabletechnicalStuffs', this.availableSecondarytechnicalStuffs);
      const technicalStuff = this.technicalStuffForm.get('technicalStuff').value;
      const technicalStuffId = this.technicalStuffForm.get('id').value;
      this.correspondingtechnicalStuffDisplayOptions = this.availableSecondarytechnicalStuffs.map((option: any) => option.technicalStuff);
      if (technicalStuff && !this.correspondingtechnicalStuffDisplayOptions.includes(technicalStuff)) {
        this.correspondingtechnicalStuffDisplayOptions.unshift(technicalStuff);
        this.presentsService.gettechnicalStuff(technicalStuffId).subscribe(currenttechnicalStuff => {
          console.log('VALUE', currenttechnicalStuff);
          // this.correspondingtechnicalStuffTags = technicalStuff ? technicalStuff.tags : [];
          // console.warn('this.correspondingtechnicalStuffTags', this.correspondingtechnicalStuffTags);
        });
      }
      this.correspondingtechnicalStuffDisplayOptions.unshift('');
      // console.warn('this.correspondingtechnicalStuffOptions', this.correspondingtechnicalStuffOptions);
    });
  }

  setupListenerFortechnicalStuff() {
    this.updateotherTechnicalStuffOptions(this.technicalStuffForm.get('technicalStuff').value);
    this.technicalStuffChanges$ = this.technicalStuffForm.get('technicalStuff').valueChanges.subscribe((value: any) => {
      console.warn('value', value);
      if (!value) {
        this.filteredTypesOptions = this.types;
        this.filteredotherTechnicalStuffOptions = this.otherTechnicalStuffs;
      }

      console.log('kokot', this.availableSecondarytechnicalStuffs.filter((option: any) => option.technicalStuff === value));
      const selectedtechnicalStuff: any = this.availableSecondarytechnicalStuffs.find((option: any) => option.technicalStuff === value);
      console.log('selectedtechnicalStuff', selectedtechnicalStuff);
      if (selectedtechnicalStuff && selectedtechnicalStuff.technicalStuff) {
        // this.technicalStuffForm.setValue({
        //   technicalStuff: selectedtechnicalStuff.technicalStuff,
        //   type: selectedtechnicalStuff.type,
        //   otherTechnicalStuff: selectedtechnicalStuff.otherTechnicalStuff,
        //   id: selectedtechnicalStuff.id,
        // });
        // return;
        this.technicalStuffForm.get('id').setValue(selectedtechnicalStuff.id);
      }

      this.updateotherTechnicalStuffOptions(value);
    });
  }

  updateotherTechnicalStuffOptions(value) {
    const selectedtechnicalStuffs = this.filtertechnicalStuffs(this.technicalStuffs, value);
    this.availableotherTechnicalStuffOptions$.next(this.otherTechnicalStuffsService.getotherTechnicalStuffsAsOptions(this.getotherTechnicalStuffsFilteredBytechnicalStuffs(selectedtechnicalStuffs)));
  }

  setupListenerForotherTechnicalStuffAndType() {
    const userotherTechnicalStuffChange$ = this.technicalStuffForm.get('otherTechnicalStuff').valueChanges.pipe(startWith(this.technicalStuffForm.get('otherTechnicalStuff').value || null));
    let triggeredBy;
    const otherTechnicalStuffObserver$: Observable<any> = combineLatest(
      userotherTechnicalStuffChange$.pipe(tap(() => { triggeredBy = 'user'; })),
      this.availableotherTechnicalStuffOptions$.pipe(tap(() => { triggeredBy = 'available'; })),
      (userInput, avaliableotherTechnicalStuffs) => {
        return {
          userInput,
          avaliableotherTechnicalStuffs,
        };
      }
    );
    this.otherTechnicalStuffChanges$ = otherTechnicalStuffObserver$.subscribe(data => {
      this.filteredotherTechnicalStuffOptions = this.filterOptionsToDisplay(data.avaliableotherTechnicalStuffs, data.userInput);
      if (!data.avaliableotherTechnicalStuffs.length) {
        this.technicalStuffForm.get('otherTechnicalStuff').setValue(null, { emitEvent: false });
      } else if (this.filteredotherTechnicalStuffOptions.length === 1 && triggeredBy !== 'user') {
        this.technicalStuffForm.get('otherTechnicalStuff').setValue(this.filteredotherTechnicalStuffOptions[0].value, { emitEvent: false });
      }

      this.filteredTypesOptions = this.otherTechnicalStuffsService.getTypesFromotherTechnicalStuffs(this.filteredotherTechnicalStuffOptions);
      if (triggeredBy === 'user' && data.userInput === '') {
        this.technicalStuffForm.get('type').setValue(null);
      } else if (this.filteredTypesOptions.length === 1) {
        this.technicalStuffForm.get('type').setValue(this.filteredTypesOptions[0]);
      }
    });
  }

  filtertechnicalStuffs(technicalStuffs = [], value) {
    if (value === null || value === undefined) {
      value = '';
    }
    return technicalStuffs.filter(technicalStuff => {
      const technicalStuffLength = technicalStuff ? technicalStuff.length : 0;
      const valueLength = value ? value.length : 0;
      const startWithLength = technicalStuffLength >= valueLength ? valueLength : technicalStuffLength;
      return technicalStuff.substring(0, startWithLength).toLocaleLowerCase() === value.substring(0, startWithLength).toLocaleLowerCase();
    });
  }

  private filterOptionsToDisplay(options: SelectOption[], value: string): SelectOption[] {
    if (!value) {
      return options;
    }
    const filterValue = value.toLowerCase();

    return options.filter(option => option.value.toLowerCase().includes(filterValue));
  }

  getotherTechnicalStuffsFilteredBytechnicalStuffs(technicalStuffs: string[]): string[] {
    const selectedotherTechnicalStuffs = [];
    technicalStuffs.forEach(technicalStuff => {
      this.technicalStuffsAndotherTechnicalStuffs[technicalStuff].forEach(technicalStuffotherTechnicalStuff => {
        if (!selectedotherTechnicalStuffs.includes(technicalStuffotherTechnicalStuff)) {
          selectedotherTechnicalStuffs.push(technicalStuffotherTechnicalStuff);
        }
      });
    });
    return selectedotherTechnicalStuffs;
  }

  get displayFn(): (option?: string) => string | undefined {
    return (option?: any): string | undefined => {
      return option ? this.otherTechnicalStuffsService.getotherTechnicalStuffLabel(option) : undefined;
    };
  }

  public onTouched: () => void = () => {};

  writeValue(val: any): void {
    // console.warn('write', val);
    if (val) {
      this.technicalStuffForm.setValue(val, { emitEvent: false });
    }
  }

  registerOnChange(fn: any): void {
    this.technicalStuffForm.valueChanges.subscribe(fn);
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    isDisabled ? this.technicalStuffForm.disable() : this.technicalStuffForm.enable();
  }

  validate(control: AbstractControl): ValidationErrors | null {
    return this.technicalStuffForm.valid ? null : { invalidForm: { valid: false, message: 'technicalStuffFrom fields are invalid' }};
  }

  ngOnDestroy() {
    this.technicalStuffChanges$.unsubscribe();
    this.otherTechnicalStuffChanges$.unsubscribe();
    this.availableotherTechnicalStuffOptions$.unsubscribe();
  }

}

