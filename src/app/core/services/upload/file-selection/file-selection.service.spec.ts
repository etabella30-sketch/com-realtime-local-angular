import { TestBed } from '@angular/core/testing';

import { FileSelectionService } from './file-selection.service';

describe('FileSelectionService', () => {
  let service: FileSelectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileSelectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
