import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnotationLayerComponent } from './annotation-layer.component';

describe('AnnotationLayerComponent', () => {
  let component: AnnotationLayerComponent;
  let fixture: ComponentFixture<AnnotationLayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnnotationLayerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AnnotationLayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
