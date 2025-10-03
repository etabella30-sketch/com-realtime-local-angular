import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'empty',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './empty.component.html',
  styleUrl: './empty.component.scss'
})
export class EmptyComponent {

  @Input() icon: any;
  @Input() head: string = '';
  @Input() desc: string = '';

}
