import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfTotechnicalStuffCreatorComponent } from './pdf-to-technicalStuff-creator.component';

describe('technicalStuffsAddListComponent', () => {
  let component: PdfTotechnicalStuffCreatorComponent;
  let fixture: ComponentFixture<PdfTotechnicalStuffCreatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PdfTotechnicalStuffCreatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PdfTotechnicalStuffCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
