import { Component, OnInit, Inject, TemplateRef, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { Popover } from 'src/app/shared/popover/popover.service';
import { PopoverRef } from 'src/app/shared/popover/popover-ref';
import { AdministrationService } from '../../administration.service';
import { ConfirmotherTechnicalStuffDialogComponent } from '../confirm-otherTechnicalStuff-dialog/confirm-otherTechnicalStuff-dialog.component';
import { DialogService } from 'src/app/shared/services/dialog.service';
import { otherTechnicalStuffsService } from '../../../shared/services/otherTechnicalStuffs.service';

@Component({
  selector: 'app-edit-otherTechnicalStuff-dialog',
  templateUrl: './edit-otherTechnicalStuff-dialog.component.html',
  styleUrls: ['./edit-otherTechnicalStuff-dialog.component.scss']
})
export class EditotherTechnicalStuffDialogComponent implements OnInit {
  @ViewChild('technicalStuffInput') technicalStuffInput: ElementRef;
  private selectedtechnicalStuffIndex: number;
  private popverRef: PopoverRef;

  public otherTechnicalStuffDefForm: FormGroup;
  public technicalStuffForm: FormGroup;
  public technicalStuffs: string[];
  public technicalStuffMode: 'add' | 'edit';
  public istechnicalStuffsArrChanged: boolean = false;
  public filteredtechnicalStuffOptions: string[] = this.getFilteredtechnicalStuffs('');

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private dialogRef: MatDialogRef<EditotherTechnicalStuffDialogComponent>,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private popper: Popover,
    private administrationService: AdministrationService,
    private dialogService: DialogService,
    private otherTechnicalStuffsService: otherTechnicalStuffsService,
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    console.log('this.data', this.data);
    const def = this.data.def;
    this.otherTechnicalStuffDefForm = this.fb.group({
      otherTechnicalStuff: [
        {
          value: def.otherTechnicalStuff || '',
          disabled: this.data.mode === 'edit',
        },
        [ Validators.required ],
      ],
      type: [
        def.type || '',
        [ Validators.required ],
      ],
    });

    this.technicalStuffForm = this.fb.group({
      technicalStuff: [
        '',
        [ Validators.required ],
      ],
    });

    this.technicalStuff.valueChanges.subscribe((value: string) => {
      this.filteredtechnicalStuffOptions = this.getFilteredtechnicalStuffs(value);
    });

    this.technicalStuffs = [ ...(def.technicalStuffs || []) ];
  }

  get otherTechnicalStuff() { return this.otherTechnicalStuffDefForm.get('otherTechnicalStuff'); }
  get type() { return this.otherTechnicalStuffDefForm.get('type'); }

  get technicalStuff() { return this.technicalStuffForm.get('technicalStuff'); }

  getFilteredtechnicalStuffs(filterBy: string): string[] {
    return this.otherTechnicalStuffsService.gettechnicalStuffs()
      .filter(technicalStuff => technicalStuff.toLowerCase().startsWith(filterBy.toLowerCase()))
      .sort();
  }

  show(content: TemplateRef<any>, origin, value: string = '', index?: number) {
    this.selectedtechnicalStuffIndex = index;
    this.technicalStuff.setValue(value);

    this.technicalStuffMode = !value && index === undefined ? 'add' : 'edit';
    this.popverRef = this.popper.open<{ technicalStuff: string }>({
      content,
      origin,
      width: '350px',
    });

    setTimeout(() => {
      if (this.technicalStuffInput) {
        this.technicalStuffInput.nativeElement.focus();
      }
    });

    this.popverRef.afterClosed$.subscribe(res => {
      this.technicalStuff.setValue('');
      this.technicalStuff.clearValidators();
      this.technicalStuff.markAsUntouched();
    });

  }

  onSavetechnicalStuff() {
    if (this.technicalStuffForm.invalid) {
      this.technicalStuffForm.markAllAsTouched();
      return;
    }

    const newtechnicalStuff = this.technicalStuff.value.trim();

    if (this.technicalStuffs.includes(newtechnicalStuff)) {
      this.dialogService.openSnackBar(`otherTechnicalStuff už toto technicalStuff má, nebude znova priradené`);
      return;
    }

    if (this.selectedtechnicalStuffIndex === undefined) {
      this.technicalStuffs.push(newtechnicalStuff);
      this.dialogService.openSnackBar(`technicalStuff bolo pridané`);
    } else {
      this.technicalStuffs[this.selectedtechnicalStuffIndex] = newtechnicalStuff;
      this.dialogService.openSnackBar(`technicalStuff bolo aktualizované`);
    }
    this.istechnicalStuffsArrChanged = true;
    this.popverRef.close();
  }

  onDeletetechnicalStuff() {
    this.technicalStuffs.splice(this.selectedtechnicalStuffIndex, 1);
    this.istechnicalStuffsArrChanged = true;
    this.popverRef.close();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSave() {
    if (this.otherTechnicalStuffDefForm.invalid) {
      this.otherTechnicalStuffDefForm.markAllAsTouched();
      return;
    }
    const originalValue = this.data.def;
    const newValue = this.otherTechnicalStuffDefForm.getRawValue();
    const newotherTechnicalStuff = newValue.otherTechnicalStuff.trim();
    const newType = newValue.type.trim();
    const updateData: any = {};

    // in create mode
    if (newotherTechnicalStuff !== originalValue.otherTechnicalStuff) {
      updateData.otherTechnicalStuff = newotherTechnicalStuff;
    }
    // changes in edit mode
    if (newType !== originalValue.type) {
      updateData.type = newType;
      updateData.label = `${newotherTechnicalStuff} - ${newType}`;
    }
    if (this.istechnicalStuffsArrChanged) {
      updateData.technicalStuffs = this.technicalStuffs;
    }
    console.log('this.data.def', this.data.def);
    console.log('this.otherTechnicalStuffDefForm.rawValue', this.otherTechnicalStuffDefForm.getRawValue());
    console.log('this.technicalStuffs', this.technicalStuffs);
    console.warn('updateData', updateData);
    // TODO: je to add alebo create? musim si pozerat, lebo mam mody, jak kokot
    if (this.data.mode === 'create') {
      const dialogRef = this.dialog.open(ConfirmotherTechnicalStuffDialogComponent, {
        width: '350px',
        data: {
          otherTechnicalStuff: updateData.otherTechnicalStuff,
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
        console.log('The dialog was closed', result);
        if (result) {
          this.administrationService.createotherTechnicalStuff(updateData)
            .then(resolved => {
              this.dialogRef.close();
              console.log('result', resolved);
              this.dialogService.openSnackBar(`otherTechnicalStuff sa podarilo vytvoriť`);
            })
            .catch(err => {
              console.warn('err', err);
              this.dialogService.openSnackBar(`otherTechnicalStuff sa nepodarilo vytvoriť!`);
            });
        }
      });

    } else {
      this.administrationService.editotherTechnicalStuff(updateData, this.data.def.id)
        .then(result => {
          this.dialogRef.close();
          console.log('result', result);
          this.dialogService.openSnackBar(`otherTechnicalStuff sa podarilo aktualizovať`);
        })
        .catch(err => {
          console.warn('err', err);
          this.dialogService.openSnackBar(`otherTechnicalStuff sa nepodarilo aktualizovať!`);
        });
    }
  }

}
