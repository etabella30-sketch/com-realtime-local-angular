import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextLayerComponent } from './text-layer.component';

describe('TextLayerComponent', () => {
  let component: TextLayerComponent;
  let fixture: ComponentFixture<TextLayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextLayerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TextLayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
