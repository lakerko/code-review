import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnonymsListComponent } from './anonyms-list.component';

describe('AnonymsComponent', () => {
  let component: AnonymsListComponent;
  let fixture: ComponentFixture<AnonymsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnonymsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnonymsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
