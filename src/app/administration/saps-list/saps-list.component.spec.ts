import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { otherTechnicalStuffsListComponent } from './otherTechnicalStuffs-list.component';

describe('otherTechnicalStuffsComponent', () => {
  let component: otherTechnicalStuffsListComponent;
  let fixture: ComponentFixture<otherTechnicalStuffsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ otherTechnicalStuffsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(otherTechnicalStuffsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
