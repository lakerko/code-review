import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddtechnicalStuffsDialogComponent } from './add-technicalStuffs-dialog.component';

describe('AddtechnicalStuffsDialogComponent', () => {
  let component: AddtechnicalStuffsDialogComponent;
  let fixture: ComponentFixture<AddtechnicalStuffsDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddtechnicalStuffsDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddtechnicalStuffsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
