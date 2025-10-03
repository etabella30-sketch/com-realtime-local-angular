import { TestBed } from '@angular/core/testing';

import { MyfileService } from './myfile.service';

describe('MyfileService', () => {
  let service: MyfileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MyfileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
