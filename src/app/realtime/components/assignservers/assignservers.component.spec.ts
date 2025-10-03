import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignserversComponent } from './assignservers.component';

describe('AssignserversComponent', () => {
  let component: AssignserversComponent;
  let fixture: ComponentFixture<AssignserversComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignserversComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AssignserversComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
