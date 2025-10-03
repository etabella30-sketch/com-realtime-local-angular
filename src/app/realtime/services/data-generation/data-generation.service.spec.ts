import { TestBed } from '@angular/core/testing';

import { DataGenerationService } from './data-generation.service';

describe('DataGenerationService', () => {
  let service: DataGenerationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataGenerationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
