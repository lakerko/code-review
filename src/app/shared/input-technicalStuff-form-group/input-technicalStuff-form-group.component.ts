import {
  Component,
  OnInit,
  Input,
  forwardRef,
  OnDestroy,
  Optional,
  Host,
  SkipSelf
} from '@angular/core';
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
  ControlContainer,
} from '@angular/forms';

import { Subscription, BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { startWith, tap } from 'rxjs/operators';

import { otherTechnicalStuffsService } from '../services/otherTechnicalStuffs.service';
import { User, SelectOption } from '../shared.model';

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
  selector: 'app-input-technicalStuff-form-group',
  templateUrl: './input-technicalStuff-form-group.component.html',
  styleUrls: ['./input-technicalStuff-form-group.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputtechnicalStuffFormGroupComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => InputtechnicalStuffFormGroupComponent),
      multi: true,
    },
  ],
})
export class InputtechnicalStuffFormGroupComponent implements OnInit, OnDestroy, ControlValueAccessor, Validator {
  @Input() initialValues: technicalStuffForm;
  @Input() user: User;
  @Input() addendum: string = '';
  @Input() formControlName: string;

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

  constructor(
    @Optional() @Host() @SkipSelf()
    private controlContainer: ControlContainer,
    private fb: FormBuilder,
    private otherTechnicalStuffsService: otherTechnicalStuffsService,
  ) { }

  ngOnInit() {
    this.technicalStuffForm  = this.fb.group({
      technicalStuff: [
        null,
      ],
      type: [
        null,
      ],
      otherTechnicalStuff: [
        null,
      ],
    });

    this.availableotherTechnicalStuffOptions$ = new BehaviorSubject(this.otherTechnicalStuffs);
    this.setupListenerFortechnicalStuff();
    this.setupListenerForotherTechnicalStuff();
    this.setValidators();
  }

  get technicalStuff() { return this.technicalStuffForm.get('technicalStuff'); }
  get type() { return this.technicalStuffForm.get('type'); }
  get otherTechnicalStuff() { return this.technicalStuffForm.get('otherTechnicalStuff'); }

  setValidators() {
    if (this.controlContainer && this.formControlName) {
      const control = this.controlContainer.control.get(this.formControlName);

      if (this.hasRequiredValidator(control)) {
        this.technicalStuff.setValidators(Validators.required);
        this.type.setValidators(Validators.required);
        this.otherTechnicalStuff.setValidators(Validators.required);
        this.technicalStuffForm.updateValueAndValidity();
      }
    }
  }

  hasRequiredValidator(control: AbstractControl): boolean {
    const validator = control && control.validator ? control.validator({} as AbstractControl) : undefined;
    return validator && validator.required ? true : false;
  }

  setupListenerFortechnicalStuff() {
    this.updateotherTechnicalStuffOptions(this.technicalStuff.value);
    this.technicalStuffChanges$ = this.technicalStuff.valueChanges.subscribe((value: any) => {
      if (!value) {
        this.filteredTypesOptions = this.types;
        this.filteredotherTechnicalStuffOptions = this.otherTechnicalStuffs;
        this.otherTechnicalStuff.setValue('');
        this.type.setValue('');
      }

      this.updateotherTechnicalStuffOptions(value);
    });
  }

  updateotherTechnicalStuffOptions(userInput) {
    this.availableotherTechnicalStuffOptions$.next(this.getotherTechnicalStuffOptions(userInput));
  }

  getotherTechnicalStuffOptions(userInput: string): SelectOption[] {
    const selectedtechnicalStuffs = this.filtertechnicalStuffs(this.technicalStuffs, userInput);
    const filteredotherTechnicalStuffs = this.getotherTechnicalStuffsFilteredBytechnicalStuffs(selectedtechnicalStuffs);
    const otherTechnicalStuffOptions = this.otherTechnicalStuffsService.getotherTechnicalStuffsAsOptions(filteredotherTechnicalStuffs);
    return otherTechnicalStuffOptions;
  }

  setupListenerForotherTechnicalStuff() {
    const userotherTechnicalStuffChange$ = this.otherTechnicalStuff.valueChanges.pipe(startWith(this.otherTechnicalStuff.value || null));
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
      // If no values are filtered, check for inconsistency between otherTechnicalStuff input value and technicalStuff value from user
      // TODO: I think something is wrong, probably redo the whole thing
      if (!this.filteredotherTechnicalStuffOptions.length && data.userInput !== this.technicalStuff.value) {
        this.filteredotherTechnicalStuffOptions = this.filterOptionsToDisplay(data.avaliableotherTechnicalStuffs, this.technicalStuff.value);
      }

      if (!data.avaliableotherTechnicalStuffs.length) {
        this.otherTechnicalStuff.setValue(null, { emitEvent: false });
      } else if (this.filteredotherTechnicalStuffOptions.length === 1 && triggeredBy !== 'user') {
        this.otherTechnicalStuff.setValue(this.filteredotherTechnicalStuffOptions[0].value, { emitEvent: false });
      }

      this.filteredTypesOptions = this.otherTechnicalStuffsService.getTypesFromotherTechnicalStuffs(this.filteredotherTechnicalStuffOptions);
      if (triggeredBy === 'user' && data.userInput === '') {
        this.type.setValue(null);
      } else if (this.filteredTypesOptions.length === 1) {
        this.type.setValue(this.filteredTypesOptions[0]);
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
      if (!this.technicalStuffsAndotherTechnicalStuffs[technicalStuff]) {
        return selectedotherTechnicalStuffs;
      }
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
