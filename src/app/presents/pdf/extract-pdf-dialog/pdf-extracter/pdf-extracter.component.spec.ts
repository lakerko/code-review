import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfExtracterComponent } from './pdf-extracter.component';

describe('PdfExtracterComponent', () => {
  let component: PdfExtracterComponent;
  let fixture: ComponentFixture<PdfExtracterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PdfExtracterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PdfExtracterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
