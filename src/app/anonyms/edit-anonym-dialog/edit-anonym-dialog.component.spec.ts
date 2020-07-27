import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAnonymDialogComponent } from './edit-anonym-dialog.component';

describe('EditAnonymDialogComponent', () => {
  let component: EditAnonymDialogComponent;
  let fixture: ComponentFixture<EditAnonymDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditAnonymDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditAnonymDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
