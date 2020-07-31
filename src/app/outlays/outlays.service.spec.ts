import { TestBed } from '@angular/core/testing';

import { DontwantsService } from './dontwants.service';

describe('DontwantsService', () => {
  let service: DontwantsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DontwantsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
