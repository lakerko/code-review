import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordAccessDialogComponent } from './password-access-dialog.component';

describe('PasswordAccessDialogComponent', () => {
  let component: PasswordAccessDialogComponent;
  let fixture: ComponentFixture<PasswordAccessDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PasswordAccessDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PasswordAccessDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
