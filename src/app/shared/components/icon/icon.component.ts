import { Component, ElementRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VariablesService } from '../../../core/services/varaibles/variables.service';

@Component({
  selector: 'icon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.scss'
})
export class IconComponent {
  @Input() name: string = '';
  @Input() type: string = 'comnicn';

  unicode;
  constructor(private elementRef: ElementRef, public vs: VariablesService) { }

  ngOnInit(): void {
    this.unicode = this.vs.getIconUnicode(this.name, this.type);
  }

}
