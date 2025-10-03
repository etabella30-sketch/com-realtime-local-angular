import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'sklton',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skeleton.component.html',
  styleUrl: './skeleton.component.scss'
})
export class SkeletonComponent {
  @Input() height: string = '10px';
  @Input() width: string = '100px';
  @Input() bg: string = 'light';
  @Input() isavatar: boolean = false;

}
