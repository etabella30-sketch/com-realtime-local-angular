import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignparticipantComponent } from './assignparticipant.component';

describe('AssignparticipantComponent', () => {
  let component: AssignparticipantComponent;
  let fixture: ComponentFixture<AssignparticipantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignparticipantComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AssignparticipantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
