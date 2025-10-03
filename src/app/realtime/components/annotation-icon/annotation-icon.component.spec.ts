import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnotationIconComponent } from './annotation-icon.component';

describe('AnnotationIconComponent', () => {
  let component: AnnotationIconComponent;
  let fixture: ComponentFixture<AnnotationIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnnotationIconComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AnnotationIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
