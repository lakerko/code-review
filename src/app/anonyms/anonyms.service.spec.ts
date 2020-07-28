import { TestBed } from '@angular/core/testing';

import { AnonymsService } from './anonyms.service';

describe('AnonymsService', () => {
  let service: AnonymsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnonymsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
