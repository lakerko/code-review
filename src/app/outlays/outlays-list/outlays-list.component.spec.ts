import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DontwantsListComponent } from './dontwants-list.component';

describe('DontwantsComponent', () => {
  let component: DontwantsListComponent;
  let fixture: ComponentFixture<DontwantsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DontwantsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DontwantsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
