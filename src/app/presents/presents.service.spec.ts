import { TestBed } from '@angular/core/testing';

import { PresentsService } from './presents.service';

describe('PresentsService', () => {
  let service: PresentsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PresentsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
