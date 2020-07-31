import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelecttechnicalStuffFormGroupComponent } from './select-technicalStuff-form-group.component';

describe('SelecttechnicalStuffFormGroupComponent', () => {
  let component: SelecttechnicalStuffFormGroupComponent;
  let fixture: ComponentFixture<SelecttechnicalStuffFormGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelecttechnicalStuffFormGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelecttechnicalStuffFormGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
