import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmotherTechnicalStuffDialogComponent } from './confirm-otherTechnicalStuff-dialog.component';

describe('ConfirmotherTechnicalStuffDialogComponent', () => {
  let component: ConfirmotherTechnicalStuffDialogComponent;
  let fixture: ComponentFixture<ConfirmotherTechnicalStuffDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmotherTechnicalStuffDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmotherTechnicalStuffDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
