import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveFeedDialogComponent } from './live-feed-dialog.component';

describe('LiveFeedDialogComponent', () => {
  let component: LiveFeedDialogComponent;
  let fixture: ComponentFixture<LiveFeedDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LiveFeedDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LiveFeedDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
