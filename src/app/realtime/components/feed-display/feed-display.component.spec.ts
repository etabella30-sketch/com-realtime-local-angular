import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedDisplayComponent } from './feed-display.component';

describe('FeedDisplayComponent', () => {
  let component: FeedDisplayComponent;
  let fixture: ComponentFixture<FeedDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedDisplayComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FeedDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
