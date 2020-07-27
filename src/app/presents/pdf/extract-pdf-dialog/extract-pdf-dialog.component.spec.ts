import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtractPdfDialogComponent } from './extract-pdf-dialog.component';

describe('ExtractPdfDialogComponent', () => {
  let component: ExtractPdfDialogComponent;
  let fixture: ComponentFixture<ExtractPdfDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExtractPdfDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtractPdfDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
