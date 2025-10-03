import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedLineComponent } from './feed-line.component';

describe('FeedLineComponent', () => {
  let component: FeedLineComponent;
  let fixture: ComponentFixture<FeedLineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedLineComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FeedLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
