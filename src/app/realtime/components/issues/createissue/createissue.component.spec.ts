import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateissueComponent } from './createissue.component';

describe('CreateissueComponent', () => {
  let component: CreateissueComponent;
  let fixture: ComponentFixture<CreateissueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateissueComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateissueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
