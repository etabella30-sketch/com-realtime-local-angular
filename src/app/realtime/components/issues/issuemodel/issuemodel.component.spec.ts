import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IssuemodelComponent } from './issuemodel.component';

describe('IssuemodelComponent', () => {
  let component: IssuemodelComponent;
  let fixture: ComponentFixture<IssuemodelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IssuemodelComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(IssuemodelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
