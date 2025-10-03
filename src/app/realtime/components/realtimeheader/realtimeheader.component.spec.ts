import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RealtimeheaderComponent } from './realtimeheader.component';

describe('RealtimeheaderComponent', () => {
  let component: RealtimeheaderComponent;
  let fixture: ComponentFixture<RealtimeheaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RealtimeheaderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RealtimeheaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
