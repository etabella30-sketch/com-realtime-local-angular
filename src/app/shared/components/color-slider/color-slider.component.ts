import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, OnInit, Output, ViewChild } from '@angular/core';

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

  @Output()
  color: EventEmitter<string> = new EventEmitter()

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
    if(this.canvas){
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


  getPositionFromColor(ctx, color) {
    var w = ctx.canvas.width,
      h = ctx.canvas.height,
      data = ctx.getImageData(0, 0, w, h), /// get image data
      buffer = data.data,                  /// and its pixel buffer
      len = buffer.length,                 /// cache length
      x, y = 0, p, px;                     /// for iterating

    /// iterating x/y instead of forward to get position the easy way
    for (; y < h; y++) {

      /// common value for all x
      p = y * 4 * w;

      for (x = 0; x < w; x++) {

        /// next pixel (skipping 4 bytes as each pixel is RGBA bytes)
        px = p + x * 4;

        /// if red component match check the others
        if (buffer[px] === color[0]) {
          if (buffer[px + 1] === color[1] &&
            buffer[px + 2] === color[2]) {

            return [x, y];
          }
        }
      }
    }
    return null;
  }


}
