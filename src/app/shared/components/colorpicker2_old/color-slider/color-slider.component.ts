import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'color-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './color-slider.component.html',
  styleUrls: ['./color-slider.component.scss']
})
export class ColorSliderComponent implements AfterViewInit {
  @ViewChild('canvas')
  canvas: ElementRef<HTMLCanvasElement>
  @Input() set inputColor(value: string) {
    if (value) {
      this.setPositionFromColor(value);
    }
  }
  @Output()
  color: EventEmitter<string> = new EventEmitter();
  @Output() newcolor = new EventEmitter<string>();

  private ctx: CanvasRenderingContext2D
  private mousedown: boolean = false
  private selectedHeight: number
  client_x: any;
  client_y: any;
  crclr: any;
  ngAfterViewInit() {
    this.draw();
    var mdl: any = { "offsetX": 7, "offsetY": 13 };
    this.onMouseDown(mdl);
    this.onMouseMove(mdl);
    // setTimeout(() => {
    this.mousedown = false
    // }, 1000);
    // 

  }

  draw() {
    if (this.canvas) {
      if (!this.ctx) {
        this.ctx = this.canvas.nativeElement.getContext('2d')
      }
      const width = this.canvas.nativeElement.width
      const height = this.canvas.nativeElement.height

      this.ctx.clearRect(0, 0, width, height)

      const gradient = this.ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, 'rgba(255, 0, 0, 1)');
      gradient.addColorStop(0.17, 'rgba(255, 255, 0, 1)');
      gradient.addColorStop(0.34, 'rgba(0, 255, 0, 1)');
      gradient.addColorStop(0.51, 'rgba(0, 255, 255, 1)');
      gradient.addColorStop(0.68, 'rgba(0, 0, 255, 1)');
      gradient.addColorStop(0.85, 'rgba(255, 0, 255, 1)');
      gradient.addColorStop(1, 'rgba(255, 0, 0, 1)');

      this.ctx.beginPath();
      this.ctx.rect(0, 0, width, height);

      this.ctx.fillStyle = gradient;
      this.ctx.fill();
      this.ctx.closePath();
      if (this.selectedHeight) {
        this.ctx.beginPath()
        this.ctx.strokeStyle = 'transparent'
        this.ctx.lineWidth = 0
        this.ctx.fillStyle = 'red'
        this.ctx.rect(0, this.selectedHeight - 5, width, 10)
        this.ctx.stroke()
        this.ctx.closePath()
        this.ctx.shadowColor = '#0000006b'
        this.ctx.shadowBlur = 9.40318
        this.ctx.shadowOffsetX = 0
        this.ctx.shadowOffsetY = 2.82096
        // filter: drop-shadow(0px 2.82096px 9.40318px rgba(148, 148, 148, 0.25));

      }
    }
  }

  @HostListener('window:mouseup', ['$event'])
  onMouseUp(evt: MouseEvent) {
    this.mousedown = false;
  }

  onMouseDown(evt: MouseEvent) {
    this.mousedown = true;
    this.selectedHeight = evt.offsetY;
    this.draw();
    this.client_x = evt.offsetX;
    this.client_y = evt.offsetY;
    this.emitColor(evt.offsetX, evt.offsetY);
  }

  onMouseMove(evt: MouseEvent) {
    if (this.mousedown) {
      this.selectedHeight = evt.offsetY;
      this.draw();
      // console.log('Hex', evt.offsetX, evt.offsetY)
      this.client_x = evt.offsetX;
      this.client_y = evt.offsetY;
      this.emitColor(evt.offsetX, evt.offsetY)
    }
  }

  emitColor(x: number, y: number) {
    const rgbaColor = this.getColorAtPosition(x, y)
    this.crclr = rgbaColor;
    this.color.emit(rgbaColor)
  }

  getColorAtPosition(x: number, y: number) {
    const imageData = this.ctx.getImageData(x, y, 1, 1).data
    return (
      'rgba(' + imageData[0] + ',' + imageData[1] + ',' + imageData[2] + ',1)'
    )
  }

  onbarselect() {
    var mdl: any = { offsetX: this.client_x, offsetY: this.client_y };
    this.onMouseDown(mdl);
  }

  setPositionFromColor(color: string) {
    const inputRgb = this.hexToRgb(color);
    const colorStops = [
      { position: 0, color: [255, 0, 0] },
      { position: 0.17, color: [255, 255, 0] },
      { position: 0.34, color: [0, 255, 0] },
      { position: 0.51, color: [0, 255, 255] },
      { position: 0.68, color: [0, 0, 255] },
      { position: 0.85, color: [255, 0, 255] },
      { position: 1, color: [255, 0, 0] }
    ];

    let minDistance = Infinity;
    let nearestColorStop = null;

    for (const colorStop of colorStops) {
      const distance = this.calculateColorDistance(inputRgb, colorStop.color);
      if (distance < minDistance) {
        minDistance = distance;
        nearestColorStop = colorStop;
      }
    }

    if (nearestColorStop) {
      this.client_y = nearestColorStop.position * this.canvas.nativeElement.height;
      this.crclr = this.rgbToHex(nearestColorStop.color);
      this.newcolor.emit(this.crclr);
      this.draw();
    }
  }

  hexToRgb(hex: string): number[] {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : null;
  }

  calculateColorDistance(color1: number[], color2: number[]): number {
    const [r1, g1, b1] = color1;
    const [r2, g2, b2] = color2;
    const rDiff = r1 - r2;
    const gDiff = g1 - g2;
    const bDiff = b1 - b2;
    return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
  }

  rgbToHex(rgb: number[]): string {
    const [r, g, b] = rgb;
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

}
