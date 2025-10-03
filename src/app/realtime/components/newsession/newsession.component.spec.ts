import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsessionComponent } from './newsession.component';

describe('NewsessionComponent', () => {
  let component: NewsessionComponent;
  let fixture: ComponentFixture<NewsessionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewsessionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NewsessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
