import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  Input,
  Output,
  SimpleChanges,
  OnChanges,
  EventEmitter,
  HostListener,
} from '@angular/core'

@Component({
  selector: 'color-palette',
  standalone: true,
  templateUrl: './color-palette.component.html',
  styleUrls: ['./color-palette.component.scss']
})
export class ColorPaletteComponent implements AfterViewInit, OnChanges {
  @Input()
  hue: string

  @Output()
  color: EventEmitter<string> = new EventEmitter(true)

  @ViewChild('canvas')
  canvas: ElementRef<HTMLCanvasElement>

  private ctx: CanvasRenderingContext2D

  private mousedown: boolean = false

  public selectedPosition: { x: number; y: number }

  ngAfterViewInit() {
    this.draw();
    // this.onmousedown2(242, 4)
    var mdl: any = { "offsetX": 242, "offsetY": 4 };
    this.onMouseDown(mdl);
    this.onMouseMove(mdl);
    // setTimeout(() => {
    this.mousedown = false;
    /*
        setTimeout(() => {
          
    
          var pixels = this.ctx.getImageData(0, 0, 1, 1);
          console.log(pixels);
    
          var rgbclr = this.hexToRgb('#d95f37ff');
          var array = [rgbclr.r,rgbclr.g,rgbclr.b];
          array = [213,125,95]; //125,169,220  //129,179,235
          // console.log(array);
          var postion = this.getPositionFromColor(this.ctx,array); //'#db572aff'
          
          console.log('rgb ', rgbclr);
          console.log('position ', postion);
        }, 3000);*/
    // }, 1000);
  }

  draw() {
    if (this.canvas) {
      if (!this.ctx) {
        this.ctx = this.canvas.nativeElement.getContext('2d');
      }
      const width = this.canvas.nativeElement.width
      const height = this.canvas.nativeElement.height
      this.ctx.fillStyle = this.hue || 'rgba(255,255,255,1)'; // 'rgba(0, 255, 0, 1)';// 
      this.ctx.fillRect(0, 0, width, height);
      const whiteGrad = this.ctx.createLinearGradient(80, -160, width + 100, 0);
      // const whiteGrad = this.ctx.createLinearGradient(262, 0, 338, 200)
      whiteGrad.addColorStop(0, 'rgba(255,255,255,1)');
      whiteGrad.addColorStop(1, 'rgba(255,255,255,0)');
      this.ctx.fillStyle = whiteGrad;
      this.ctx.fillRect(0, 0, width, height);
      this.ctx.filter;

      // const blackGrad = this.ctx.createLinearGradient(0, 0, 0, height)
      // blackGrad.addColorStop(0, 'rgba(0,0,0,0)')
      // blackGrad.addColorStop(1, 'rgba(0,0,0,1)')

      // this.ctx.fillStyle = blackGrad
      // this.ctx.fillRect(0, 0, width, height)

      if (this.selectedPosition) {
        this.ctx.strokeStyle = 'white'
        this.ctx.fillStyle = 'white'
        this.ctx.shadowColor = '#0000006b'
        this.ctx.shadowBlur = 0
        this.ctx.shadowOffsetX = 0
        this.ctx.shadowOffsetY = 0
        this.ctx.beginPath()
        this.ctx.arc(
          this.selectedPosition.x,
          this.selectedPosition.y,
          8,
          0,
          2 * Math.PI
        )
        this.ctx.lineWidth = 2
        this.ctx.stroke()
      }
    }

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['hue']) {
      this.draw()
      const pos = this.selectedPosition
      if (pos) {
        // var clrs = this.getColorAtPosition(pos.x, pos.y)
        this.color.emit(this.getColorAtPosition(pos.x, pos.y))

      }
    }
  }

  @HostListener('window:mouseup', ['$event'])
  onMouseUp(evt: MouseEvent) {
    this.mousedown = false
  }

  onMouseDown(evt: MouseEvent) {
    this.mousedown = true;
    this.selectedPosition = { x: evt.offsetX, y: evt.offsetY };
    this.draw();
    if (evt.offsetY > 295 || evt.offsetX > 295) {
      return;
    }
    this.genratetooltip(evt);
    this.color.emit(this.getColorAtPosition(evt.offsetX, evt.offsetY));
  }



  genratetooltip(evt) {

    const rgbaColor = this.getColorAtPosition(evt.offsetX, evt.offsetY);
    const hexColor = this.rgba2hex(rgbaColor);
    const tooltip = document.createElement('span');
    tooltip.className = 'custtooltip';
    tooltip.textContent = hexColor;
    tooltip.style.position = 'absolute';
    tooltip.style.left = `${evt.offsetX + 10}px`;
    tooltip.style.top = `${evt.offsetY + 10}px`;

    // Remove any existing tooltip elements
    const existingTooltips = document.querySelectorAll('#palleteparent .custtooltip');
    existingTooltips.forEach(tooltip => tooltip.remove());

    // Get the palleteparent div element
    const palleteParent = document.getElementById('palleteparent');

    // Append the new tooltip to the palleteparent div
    if (palleteParent) {
      palleteParent.appendChild(tooltip);
    }
  }


  onMouseMove(evt: MouseEvent) {
    if (this.mousedown) {
      this.selectedPosition = { x: evt.offsetX, y: evt.offsetY }
      this.draw();

      if (evt.offsetY > 295 || evt.offsetX > 295) {
        return;
      }

      const rgbaColor = this.getColorAtPosition(evt.offsetX, evt.offsetY);
      this.genratetooltip(evt);

      this.color.emit(rgbaColor);
    }
  }

  emitColor(x: number, y: number) {
    const rgbaColor = this.getColorAtPosition(x, y);
    // console.log('plat slide',rgbaColor);
    this.color.emit(rgbaColor)
  }

  getColorAtPosition(x: number, y: number) {
    const imageData = this.ctx.getImageData(x, y, 1, 1).data
    return (
      'rgba(' + imageData[0] + ',' + imageData[1] + ',' + imageData[2] + ',1)'
    )
  }



  rgba2hex(orig) {
    var a: any, isPercent,
      rgb = orig.replace(/\s/g, '').match(/^rgba?\((\d+),(\d+),(\d+),?([^,\s)]+)?/i),
      alpha = (rgb && rgb[4] || "").trim(),
      hex = rgb ?
        (rgb[1] | 1 << 8).toString(16).slice(1) +
        (rgb[2] | 1 << 8).toString(16).slice(1) +
        (rgb[3] | 1 << 8).toString(16).slice(1) : orig;
    if (alpha !== "") {
      a = alpha;
    } else {
      a = 1;
    }
    // multiply before convert to HEX
    a = ((a * 255) | 1 << 8).toString(16).slice(1)
    hex = hex + a;
    return '#' + hex;
  }


  hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.replace(/#/g, '').substring(0, 6));
    return result ? {
      // s: (parseInt(result[0], 16) / 255),
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
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
        // if (buffer[px] === color[0]) {
        // if (buffer[px + 1] === color[1] && buffer[px + 2] === color[2]) {
        if (buffer[px] === color[1] && buffer[px] === color[2]) {

          return [x, y];
        }
        // }
      }
    }
    return null;
  }


}