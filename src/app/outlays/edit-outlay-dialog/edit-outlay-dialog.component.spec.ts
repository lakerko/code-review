import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditDontwantDialogComponent } from './edit-dontwant-dialog.component';

describe('NewDontwantDialogComponent', () => {
  let component: EditDontwantDialogComponent;
  let fixture: ComponentFixture<EditDontwantDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditDontwantDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditDontwantDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
