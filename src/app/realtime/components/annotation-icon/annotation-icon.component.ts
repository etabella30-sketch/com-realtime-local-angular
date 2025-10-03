import { Component, Input } from '@angular/core';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'annotation-icon',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './annotation-icon.component.html',
  styleUrl: './annotation-icon.component.scss'
})
export class AnnotationIconComponent {
  @Input() issueCount: number = 0;
  @Input() isActive:boolean;
}
