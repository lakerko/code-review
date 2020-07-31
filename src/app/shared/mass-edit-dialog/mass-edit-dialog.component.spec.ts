import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MassEditDialogComponent } from './mass-edit-dialog.component';

describe('MassEditDialogComponent', () => {
  let component: MassEditDialogComponent;
  let fixture: ComponentFixture<MassEditDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MassEditDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MassEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
