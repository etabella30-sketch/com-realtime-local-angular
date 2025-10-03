import { TestBed } from '@angular/core/testing';

import { CheckDuplicacyService } from './check-duplicacy.service';

describe('CheckDuplicacyService', () => {
  let service: CheckDuplicacyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CheckDuplicacyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
