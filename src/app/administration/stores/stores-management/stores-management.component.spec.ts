import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StoresManagementComponent } from './stores-management.component';

describe('StoresManagementComponent', () => {
  let component: StoresManagementComponent;
  let fixture: ComponentFixture<StoresManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StoresManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StoresManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
