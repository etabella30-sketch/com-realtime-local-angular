import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ColorPaletteComponent } from '../color-palette/color-palette.component';
import { ColorSliderComponent } from '../color-slider/color-slider.component';
import { MatSliderModule } from '@angular/material/slider';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-colorpicker',
  standalone: true,
  imports: [CommonModule, ColorPaletteComponent, ColorSliderComponent, MatSliderModule, FormsModule],
  templateUrl: './colorpicker.component.html',
  styleUrls: ['./colorpicker.component.scss'],
})
export class ColorpickerComponent implements OnInit {
  @ViewChildren('colorItem') colorItems: QueryList<ElementRef>;
  @Input('colorslist') colorslist: any;
  @Input() myColor: any;
  @Output() myColorChange = new EventEmitter<string>();
  movableItem = { x: 0, y: 0 };
  isDragging = false;
  currentcolor: number = 0;
  mousestopcords: any = { x: 0, y: 0 };
  currentHue = 10;
  colorloded: boolean = false;
  currenthueVal = 0;
  hueArray: any = [
    10, 30, 45, 61, 75, 90, 112, 132, 150, 165,
    182, 200, 220, 236, 255, 276, 291, 312, 329, 348
  ];


  lightnessValues: any = [
    97, 95, 93, 91, 89, 87, 85, 83, 81, 79,
    95.1, 93.1, 91.1, 89.1, 87.1, 85.1, 83.1, 81.1, 79.1, 77,
    93.2, 91.2, 89.2, 87.2, 85.2, 83.2, 81.2, 79.2, 77.2, 75,
    91.3, 89.3, 87.3, 85.3, 83.3, 81.3, 79.3, 77.3, 75.3, 73,
    89.4, 87.4, 85.4, 83.4, 81.4, 79.4, 77.4, 75.4, 73.4, 71,
    87.5, 85.5, 83.5, 81.5, 79.5, 77.5, 75.5, 73.5, 71.5, 69,
    85.6, 83.6, 81.6, 79.6, 77.6, 75.6, 73.6, 71.6, 69.6, 67,
    83.7, 81.7, 79.7, 77.7, 75.7, 73.7, 71.7, 69.7, 67.7, 65,
    81.8, 79.8, 77.8, 75.8, 73.8, 71.8, 69.8, 67.8, 65.8, 63,
    79.9, 77.9, 75.9, 73.9, 71.9, 69.9, 67.9, 65.9, 63.9, 61
  ];

  colors: any = [];

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {

    if (!this.myColor.startsWith('#')) {
      // Add '#' at the beginning of the this.myColor
      this.myColor = '#' + this.myColor;
    } else {
      // Remove duplicate '#' characters from the beginning of the color code
      while (this.myColor.charAt(1) === '#') {
        this.myColor = this.myColor.slice(1);
      }
    }
    if (this.myColor && this.myColor.length <= 7) {
      console.log('coverted hsl ', this.myColor);

      const hsl: any = this.rgbToHsl(this.hexToRgb(this.myColor)[0], this.hexToRgb(this.myColor)[1], this.hexToRgb(this.myColor)[2]);
      this.myColor = this.myColor.slice(1);
      console.log('coverted hsl ', hsl);

      this.currentcolor = hsl[0];
      const closesehue = this.hueArray.reduce((prev, curr) => {
        return Math.abs(curr - hsl[0]) < Math.abs(prev - hsl[0]) ? curr : prev;
      });;

      console.log('closesehue', closesehue);

      this.currenthueVal = this.hueArray.findIndex(hue => hue === closesehue);

      console.log('closesehue', closesehue);

      this.genratecolor(hsl[0]);
      setTimeout(() => {
        console.log('after timeout', this.colorItems);
        const position = this.findColorPosition(hsl);
        this.movableItem.x = position.x;
        this.movableItem.y = position.y;
        this.colorloded = true;
      }, 100);
    }
    else {

      const hsl: any = this.rgbToHsl(this.hexToRgb(this.myColor)[0], this.hexToRgb(this.myColor)[1], this.hexToRgb(this.myColor)[2]);

      this.currenthueVal = 0;
      this.genratecolor(hsl.h);
      const position = this.findColorPosition(hsl);
    }


  }

  genratecolor(hue: number) {
    this.colors = this.generateHslGradient(hue);
    console.log(this.colors);
  }

  generateHslGradient(hue: any) {
   
    this.currentcolor = hue;
    // let rgbcolor = this.lightnessValues.map(lightness => this.rgbToHex(this.hslToRgb(hue, 100, lightness)[0], this.hslToRgb(hue, 100, lightness)[1], this.hslToRgb(hue, 100, lightness)[2]));
    return this.lightnessValues.map(lightness => lightness);
    // let [r, g, b]: any = this.hslToRgb(this.hslToRgb[0], this.hslToRgb[1], this.hslToRgb[2]);
    // return this.lightnessValues.map(lightness => this.hslToHex(`hsl(${hue}, 100%, ${lightness}%)`));
    // return rgbcolor;
  }

  rgbToHex(r: number, g: number, b: number): string {
    const toHex = (value: number) => {
      const hex = value.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return toHex(r) + toHex(g) + toHex(b);
  }

  onMouseDown(event: MouseEvent) {
    this.isDragging = true;
  }


  onMouseUp(event: MouseEvent) {
   
    this.isDragging = false;

    const boxRect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = event.clientX - boxRect.left;
    const y = event.clientY - boxRect.top;
    if (x >= 0 && x <= 270 && y >= 0 && y <= 270) {
      this.movableItem.x = x;
      this.movableItem.y = y;
    }

    const huecode = this.getElementBehind(event.clientX, event.clientY);

    this.mousestopcords = { x: event.clientX, y: event.clientY };


    if (huecode) {
      console.log(huecode);
      const l = Number(huecode);
      console.log(this.currentcolor, 100, l);
      console.log(this.hslToRgb(this.currentcolor, 100, l));
      console.log(this.rgbToHex(this.hslToRgb(this.currentcolor, 100, l)[0], this.hslToRgb(this.currentcolor, 100, l)[1], this.hslToRgb(this.currentcolor, 100, l)[2]));
      const hexcolor = this.rgbToHex(this.hslToRgb(this.currentcolor, 100, l)[0], this.hslToRgb(this.currentcolor, 100, l)[1], this.hslToRgb(this.currentcolor, 100, l)[2]);
      this.myColorChange.emit(hexcolor);
    }
  }

  onMouseMove(event: MouseEvent) {
    if (this.isDragging) {
      const boxRect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      const x = event.clientX - boxRect.left;
      const y = event.clientY - boxRect.top;
      if (x >= 0 && x <= 285 && y >= 0 && y <= 285) {
        this.movableItem.x = x;
        this.movableItem.y = y;
      }
    }
  }

  getElementBehind(x: number, y: number) {
    const elements = document.elementsFromPoint(x, y);
    const itemElement = elements.find(el => el.classList.contains('item'));
    if (itemElement) {
      return itemElement.getAttribute('huecode');
    }
    return null;
  }


  constructor(private cdr: ChangeDetectorRef) { }

  colorchange() {
   
    const hue = this.hueArray[this.currenthueVal];
    this.genratecolor(hue);


    const huecode = this.getElementBehind(this.mousestopcords.x, this.mousestopcords.y);

    if (huecode) {
      console.log(huecode);
      const l = Number(huecode);
      console.log(this.currentcolor, 100, l);
      console.log(this.hslToRgb(this.currentcolor, 100, l));
      console.log(this.rgbToHex(this.hslToRgb(this.currentcolor, 100, l)[0], this.hslToRgb(this.currentcolor, 100, l)[1], this.hslToRgb(this.currentcolor, 100, l)[2]));
      const hexcolor = this.rgbToHex(this.hslToRgb(this.currentcolor, 100, l)[0], this.hslToRgb(this.currentcolor, 100, l)[1], this.hslToRgb(this.currentcolor, 100, l)[2]);
      this.myColorChange.emit(hexcolor);
    }

  }

  hexToHsl(hex: string): { h: number; s: number; l: number } {
    let r = parseInt(hex.substring(1, 3), 16) / 255;
    let g = parseInt(hex.substring(3, 5), 16) / 255;
    let b = parseInt(hex.substring(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    let l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);

    // Ensure hue is within the range of 0 to 359
    h = (h + 360) % 360;

    // Ensure saturation and lightness are within the range of 0 to 100
    s = Math.min(Math.max(s, 0), 100);
    l = Math.min(Math.max(l, 0), 100);

    return { h, s, l };
  }


  findClosestColor(hsl: { h: number; s: number; l: number }): string {
    const distances = this.colors.map(color => {
      const [h, s, l] = color.replace(/[^\d,]/g, '').split(',').map(Number);
      const dh = Math.min(Math.abs(hsl.h - h), 360 - Math.abs(hsl.h - h));
      const ds = Math.abs(hsl.s - s);
      const dl = Math.abs(hsl.l - l);
      return Math.sqrt(dh * dh + ds * ds + dl * dl);
    });
    const minDistance = Math.min(...distances);
    const closestColorIndex = distances.indexOf(minDistance);
    return this.colors[closestColorIndex];
  }


  findColorPosition(hsl: { h: number; s: number; l: number }): { x: number; y: number } {
    
    const closestLightness = this.lightnessValues.reduce((prev, curr) => {
      return Math.abs(curr - hsl[2]) < Math.abs(prev - hsl[2]) ? curr : prev;
    });;

    const closestLightnessIndex = this.lightnessValues.indexOf(closestLightness);

    return this.findColorPosition2(closestLightnessIndex);
  }

  findColorPosition2(index: number): { x: number; y: number } {
    
    if (this.colorItems && this.colorItems.length) {
      const colorItem = this.colorItems.toArray()[index];
      if (colorItem) {
        const rect = colorItem.nativeElement.getBoundingClientRect();
        const parentRect = colorItem.nativeElement.parentElement.getBoundingClientRect();
        const x = rect.left - parentRect.left;
        const y = rect.top - parentRect.top;
        this.mousestopcords = { x: rect.x, y: rect.y }

        return { x, y };
      }
    }
    return { x: 0, y: 0 };
  }



  hexToRgb(hex: string): number[] {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [0, 0, 0];
  }

  rgbToHsl(r: number, g: number, b: number): number[] {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }

      h /= 6;
    }

    return [Math.round(h * 360), Math.round(s * 100), +(l * 100).toFixed(1)];
  }



  hslToRgb(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;

    let r, g, b;

    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;

      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    let r2 = Math.round(r * 255);
    let g2 = Math.round(g * 255);
    let b2 = Math.round(b * 255);

    var rgbcolor = [r2, g2, b2]

    // return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
    return rgbcolor;

  }

  // hueToRgb(p, q, t) {
  //   if (t < 0) t += 1;
  //   if (t > 1) t -= 1;
  //   if (t < 1 / 6) return p + (q - p) * 6 * t;
  //   if (t < 1 / 2) return q;
  //   if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  //   return p;
  // }


}