import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateReclamationDialogComponent } from './create-reclamation-dialog.component';

describe('CreateReclamationDialogComponent', () => {
  let component: CreateReclamationDialogComponent;
  let fixture: ComponentFixture<CreateReclamationDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateReclamationDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateReclamationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
