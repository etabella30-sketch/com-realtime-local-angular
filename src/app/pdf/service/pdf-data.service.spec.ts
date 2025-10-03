import { TestBed } from '@angular/core/testing';

import { PdfDataService } from './pdf-data.service';

describe('PdfDataService', () => {
  let service: PdfDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PdfDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
