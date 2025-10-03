import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetupscreenComponent } from './setupscreen.component';

describe('SetupscreenComponent', () => {
  let component: SetupscreenComponent;
  let fixture: ComponentFixture<SetupscreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SetupscreenComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SetupscreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
