import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InputtechnicalStuffFormGroupComponent } from './input-technicalStuff-form-group.component';

describe('technicalStuffGroupFormComponent', () => {
  let component: InputtechnicalStuffFormGroupComponent;
  let fixture: ComponentFixture<InputtechnicalStuffFormGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InputtechnicalStuffFormGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InputtechnicalStuffFormGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
