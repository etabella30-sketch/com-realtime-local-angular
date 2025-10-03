import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CdkTextareaAutosize, TextFieldModule } from '@angular/cdk/text-field';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { VariablesService } from '../../../core/services/varaibles/variables.service';
@Component({
  selector: 'txtarea',
  standalone: true,
  imports: [CdkTextareaAutosize, TextFieldModule, CommonModule,MatFormFieldModule,MatInputModule],
  templateUrl: './textarea.component.html',
  styleUrl: './textarea.component.scss'
})
export class TextareaComponent {
  @Input() disabled: boolean = false;
  @Input() error: boolean = false;
  @Input() placeholder: string = '';
  @Input() autosize: boolean = true;
  @Input() row: boolean = true;
  @Input() value: string = '';
  @Input() minrows: number = 1;
  @Input() maxlength: number = 150;
  @Output() valueChange = new EventEmitter<any>();

  constructor(public vs: VariablesService) { }

  get inputClasses() {
    if (this.disabled) {
      return `${this.vs.inputvarnts.baseClasses} ${this.vs.inputvarnts.disabledClasses}`;
    } else if (this.error) {
      return `${this.vs.inputvarnts.baseClasses} ${this.vs.inputvarnts.errorClasses}`;
    } else {
      return `${this.vs.inputvarnts.baseClasses} ${this.vs.inputvarnts.normalClasses}`;
    }
  }

  oninput(event: any) {
    this.valueChange.emit(event.target.value);
  }
}
