import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EdittechnicalStuffDialogComponent } from './edit-technicalStuff-dialog.component';

describe('EdittechnicalStuffDialogComponent', () => {
  let component: EdittechnicalStuffDialogComponent;
  let fixture: ComponentFixture<EdittechnicalStuffDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EdittechnicalStuffDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EdittechnicalStuffDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
