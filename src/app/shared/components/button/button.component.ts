import { CommonModule } from '@angular/common';
import { booleanAttribute, Component, Input } from '@angular/core';
import { VariablesService } from '../../../core/services/varaibles/variables.service';

@Component({
  selector: 'btn',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss'
})
export class ButtonComponent {
  @Input() mode: string = 'solid';
  @Input() text: string = '';
  @Input() disabled: boolean = false;
  @Input() square: boolean = false;
  @Input() addcls: string = '';
  @Input() isloading: boolean = false;
  @Input({ transform: booleanAttribute }) issmall: boolean = false;
  @Input({ transform: booleanAttribute }) active: boolean = false;
  @Input({ transform: booleanAttribute }) noborder: boolean = false;


  constructor(public vs: VariablesService) { };

  get buttonClasses() {
    return `${this.addcls}  ${this.active ? this.vs.btnvarnt.active : ''} ${this.noborder ? this.vs.btnvarnt.noborder : ''}  ${this.vs.btnvarnt[this.mode] || ''}`;
  }


}
