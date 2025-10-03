import { TestBed } from '@angular/core/testing';

import { TostbarService } from './tostbar.service';

describe('TostbarService', () => {
  let service: TostbarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TostbarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
