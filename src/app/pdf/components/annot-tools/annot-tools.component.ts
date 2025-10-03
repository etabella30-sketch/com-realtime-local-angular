import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { CommonModule } from '@angular/common';
import { highlightToolType } from '../../interfaces/pdf.interface';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'annot-tools',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, CommonModule,MatTooltipModule],
  templateUrl: './annot-tools.component.html',
  styleUrl: './annot-tools.component.scss'
})
export class AnnotToolsComponent {
  @Output() OnClose = new EventEmitter<void>();
  @Output() OnModeChange = new EventEmitter<highlightToolType>();
  @Input() annotToolMode: highlightToolType;

  icons:any[] = [
    {name:'highlighter',type:'F',toolTip:'Highlighter'},
    {name:'pencil',type:'DR',toolTip:'Freehand'},
    {name:'shape',type:'R',toolTip:'Shape'},
    {name:'doctool',type:'D',toolTip:'Doc link'},
    {name:'webtool',type:'W',toolTip:'Web link'},
  ]
  constructor(private cdr:ChangeDetectorRef) { }
  onAnnotClose(){
    this.OnClose.emit()
  }

  changeType(type:highlightToolType){
    this.annotToolMode = type;
    this.OnModeChange.emit(this.annotToolMode);
    this.cdr.detectChanges();
  }

}
