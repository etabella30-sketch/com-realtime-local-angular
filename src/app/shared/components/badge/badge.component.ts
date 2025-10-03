import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VariablesService } from '../../../core/services/varaibles/variables.service';

@Component({
  selector: 'badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './badge.component.html',
  styleUrl: './badge.component.scss'
})
export class BadgeComponent {

  @Input() type: string = 'solid';
  @Input() disabled: boolean = false;
  @Input() square: boolean = false;
  @Input() addcls: string = '';

  constructor(public vs: VariablesService) {

  }


  get buttonClasses() {
    return `${this.addcls} ${this.vs.badgevarnt[this.type] || ''}`;
  }

}
