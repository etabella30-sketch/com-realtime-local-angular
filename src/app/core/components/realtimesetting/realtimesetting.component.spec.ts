import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RealtimesettingComponent } from './realtimesetting.component';

describe('RealtimesettingComponent', () => {
  let component: RealtimesettingComponent;
  let fixture: ComponentFixture<RealtimesettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RealtimesettingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RealtimesettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
