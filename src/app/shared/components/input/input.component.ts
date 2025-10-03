import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, forwardRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';
import { inputicon } from '../../interfaces/input.interface';
import { VariablesService } from '../../../core/services/varaibles/variables.service';

@Component({
  selector: 'inpt',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss'
})
export class InputComponent {
  @Input() disabled: boolean = false;
  @Input() readonly: boolean = false;
  @Input() error: boolean = false;
  @Input() placeholder: string = '';
  @Input() isrequired: boolean = false;
  @Input() showlabel: boolean = true;
  @Input() isoutside: boolean = false;
  @Input() inlinemode: boolean = false;
  @Input() labelclas: string = '';
  @Input() inptclas: string = '';
  @Input() iconclas: string = '';
  @Input() type: string = 'text';
  @Input() maxlength: number = 80;
  @Input() icon: inputicon;
  @Input() value: any;
  @Input() focus: any;
  @Output() valueChange = new EventEmitter<any>();
  @Output() focusOut = new EventEmitter<any>();
  showhide: boolean = false;
  @ViewChild("maininput") input: ElementRef;
  constructor(public vs: VariablesService) { }



  ngAfterViewInit(): void {
    if (this.focus) {
      this.input.nativeElement.focus();
    }
  }

  get inputClasses() {
    if (this.disabled) {
      return `${this.inptclas} ${this.vs.inputvarnts.baseClasses} ${this.vs.inputvarnts.disabledClasses}`;
    }
    else if (this.error) {
      return `${this.inptclas} ${this.vs.inputvarnts.baseClasses} ${this.vs.inputvarnts.errorClasses}`;
    }
    else if (this.inlinemode) {
      return `${this.inptclas} ${this.vs.inputvarnts.baseClasses} ${this.vs.inputvarnts.inlineClasses}`;
    }
    else {
      return `${this.inptclas} ${this.vs.inputvarnts.baseClasses} ${this.vs.inputvarnts.normalClasses}`;
    }
  }

  // get inputClasses() {
  //   var mode = 'normalClasses';
  //   if (this.disabled) {
  //     mode = 'disabledClasses';
  //   }
  //   if (this.error) {
  //     mode = 'errorClasses';
  //   }
  //   if (this.inlinemode) {
  //     mode = 'inlineClasses';
  //   }
  //   return `${this.inptclas} ${this.vs.inputvarnts.baseClasses} ${this.vs.inputvarnts[mode] || ''}`;
  // }

  oninput(event: any) {
    this.valueChange.emit(event.target.value);
  }
  focusOuts(flag) {
    this.focusOut.emit(flag);
  }


}
