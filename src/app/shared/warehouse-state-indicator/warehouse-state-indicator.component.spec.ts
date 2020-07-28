import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WarehouseStateIndicatorComponent } from './warehouse-state-indicator.component';

describe('WarehouseStateIndicatorComponent', () => {
  let component: WarehouseStateIndicatorComponent;
  let fixture: ComponentFixture<WarehouseStateIndicatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WarehouseStateIndicatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WarehouseStateIndicatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
