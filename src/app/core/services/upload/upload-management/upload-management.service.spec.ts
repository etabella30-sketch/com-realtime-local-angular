import { TestBed } from '@angular/core/testing';

import { UploadManagementService } from './upload-management.service';

describe('UploadManagementService', () => {
  let service: UploadManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UploadManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
