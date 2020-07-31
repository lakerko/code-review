import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditotherTechnicalStuffDialogComponent } from './edit-otherTechnicalStuff-dialog.component';

describe('EditotherTechnicalStuffDialogComponent', () => {
  let component: EditotherTechnicalStuffDialogComponent;
  let fixture: ComponentFixture<EditotherTechnicalStuffDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditotherTechnicalStuffDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditotherTechnicalStuffDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
