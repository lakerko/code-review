import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditReclamationDialogComponent } from './edit-reclamation-dialog.component';

describe('EditReclamationDialogComponent', () => {
  let component: EditReclamationDialogComponent;
  let fixture: ComponentFixture<EditReclamationDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditReclamationDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditReclamationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
