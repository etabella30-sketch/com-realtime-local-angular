import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ColorPaletteComponent } from '../color-palette/color-palette.component';
import { ColorSliderComponent } from '../color-slider/color-slider.component';

@Component({
  selector: 'app-colorpicker',
  standalone: true,
  imports: [CommonModule, ColorPaletteComponent, ColorSliderComponent],
  templateUrl: './colorpicker.component.html',
  styleUrls: ['./colorpicker.component.scss'],
})
export class ColorpickerComponent implements OnInit {
  public hue: string
  public color: string
  // @Input('colorchangeform') frm: any;
  @Input('colorslist') colorslist: any;



  @Input()
  myColor: string;

  @Output()
  myColorChange = new EventEmitter<string>();



  @Output()
  onClose = new EventEmitter<string>();

  constructor() { }

  ngOnInit(): void {
    this.color = this.myColor;
    this.hue = this.myColor;
  }
  ngAfterViewInit() {
  }

  onclr(e) {

    // this.zone.run(()=>{
    this.color = this.rgba2hex(e);
    // console.log('convert to hex',this.color);
    // var rgb = this.hexToRgb(this.color);
    // console.log('again rgb',rgb);
    this.myColor = this.color;
    this.myColorChange.emit(this.myColor);
    // this.frm.patchValue({
    //   [this.key]:this.color
    // });
    // })
    // this.colorchange = this.color;
  }

  rgba2hex(orig) {
    var a: any, isPercent,
      rgb = orig.replace(/\s/g, '').match(/^rgba?\((\d+),(\d+),(\d+),?([^,\s)]+)?/i),
      alpha = (rgb && rgb[4] || "").trim(),
      hex = rgb ?
        (rgb[1] | 1 << 8).toString(16).slice(1) +
        (rgb[2] | 1 << 8).toString(16).slice(1) +
        (rgb[3] | 1 << 8).toString(16).slice(1) : orig;
    // if (alpha !== "") {
    //   a = alpha;
    // } else {
    //   a = 1;
    // }
    // multiply before convert to HEX
    // a = ((a * 255) | 1 << 8).toString(16).slice(1)
    hex = hex;
    return hex;
  }

  ngOnDestroy() {
    this.onClose.emit('CLOSE');
  }

  selectColor(color) {
    this.myColor = color;
    this.myColorChange.emit(this.myColor);

  }

}
