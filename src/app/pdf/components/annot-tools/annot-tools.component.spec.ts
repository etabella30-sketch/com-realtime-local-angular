import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnotToolsComponent } from './annot-tools.component';

describe('AnnotToolsComponent', () => {
  let component: AnnotToolsComponent;
  let fixture: ComponentFixture<AnnotToolsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnnotToolsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AnnotToolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
