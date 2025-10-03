import { TestBed } from '@angular/core/testing';

import { UpldService } from './upld.service';

describe('UpldService', () => {
  let service: UpldService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UpldService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
