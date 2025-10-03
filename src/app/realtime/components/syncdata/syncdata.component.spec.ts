import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SyncdataComponent } from './syncdata.component';

describe('SyncdataComponent', () => {
  let component: SyncdataComponent;
  let fixture: ComponentFixture<SyncdataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SyncdataComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SyncdataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
