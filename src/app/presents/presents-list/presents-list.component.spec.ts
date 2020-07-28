import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PresentsListComponent } from './presents-list.component';

describe('PresentsComponent', () => {
  let component: PresentsListComponent;
  let fixture: ComponentFixture<PresentsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PresentsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PresentsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
