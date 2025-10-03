import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnotVersionComponent } from './annot-version.component';

describe('AnnotVersionComponent', () => {
  let component: AnnotVersionComponent;
  let fixture: ComponentFixture<AnnotVersionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnnotVersionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AnnotVersionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
