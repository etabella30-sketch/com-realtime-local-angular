import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, Input, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { toolEvents } from '../../../pdf/interfaces/pdf.interface';
import { IconComponent } from '../icon/icon.component';
import { MatTooltipModule } from '@angular/material/tooltip';

interface ImageInfo {
  url: string;
  alt: string;
}
@Component({
  selector: 'image',
  standalone: true,
  imports: [CommonModule, DragDropModule, IconComponent, MatTooltipModule],
  templateUrl: './img.component.html',
  styleUrl: './img.component.scss'
})
export class ImgComponent implements AfterViewInit {
  @Input() images: ImageInfo[] = [];
  @Output() OnEvent = new EventEmitter<toolEvents>();
  @ViewChild('mainImage') mainImageEl!: ElementRef;

  currentIndex = 0;
  scale = 1;
  rotation = 0;

  ngAfterViewInit() {
    this.resetTransform();
  }

  previousImage() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.resetTransform();
    }
  }

  nextImage() {
    if (this.currentIndex < this.images.length - 1) {
      this.currentIndex++;
      this.resetTransform();
    }
  }

  setCurrentImage(index: number) {
    this.currentIndex = index;
    this.resetTransform();
  }

  zoomIn() {
    this.scale += 0.1;
    this.updateTransform();
  }

  zoomOut() {
    if (this.scale > 0.1) {
      this.scale -= 0.1;
      this.updateTransform();
    }
  }

  rotateLeft() {
    this.rotation -= 90;
    this.updateTransform();
  }

  rotateRight() {
    this.rotation += 90;
    this.updateTransform();
  }

  resetTransform() {
    this.scale = 1;
    this.rotation = 0;
    this.updateTransform();
  }

  private updateTransform() {
    if (this.mainImageEl) {
      this.mainImageEl.nativeElement.style.transform = this.getImageTransform();
    }
  }

  getImageTransform(): string {
    return `scale(${this.scale}) rotate(${this.rotation}deg)`;
  }

  OnDoubleClick() {
    this.OnEvent.emit({ event: 'OPEN-IMAGE', data: null });
  }
}
