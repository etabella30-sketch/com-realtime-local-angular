import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output, SimpleChange } from '@angular/core';
import { AnnotationIconComponent } from '../../annotation-icon/annotation-icon.component';
import { Annotation } from '../../../models/annotation.interface';
import { FeedDisplayService } from '../../../services/feed-display.service';
import { TextCoordinateService } from './text-coordinate.service';
import { last } from 'rxjs';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { MatMenuModule } from '@angular/material/menu';
import { NotesComponent } from '../../notes/notes.component';
import { InitDirective } from '../../../directives/init.directive';

@Component({
  selector: 'app-annotation-layer',
  standalone: true,
  imports: [CommonModule, AnnotationIconComponent, ButtonComponent, MatMenuModule, NotesComponent, InitDirective],
  templateUrl: './annotation-layer.component.html',
  styleUrls: ['./annotation-layer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnnotationLayerComponent {
  @Input() annotations: Annotation[] = [];
  @Input() hyperlinksicons: any = [];
  @Input() lines: any;
  @Input() timestamp: number = 0;
  @Input() nEditid: string;
  @Input() pageno: number;
  showhide: boolean = true;
  @Input() currentIsseuDetailId: string;
  @Output() OnIconClick = new EventEmitter<any>();
  @Input() selectedFont: any;
  @Input() mode: string = 'L';
  data = {
    "search": "524240017",
    "destination": "RT0524240017gh",
    isBold: false,
  };

  startIndex = -1;
  lastIndex = -1;
  y_offset = 63;
  y_height = 24;
  startCoordinates: { x: number, y: number, width: number, endX: number } = null;
  endCoordinates: { x: number, y: number, width: number, endX: number } = null;

  constructor(private textCoordinateService: TextCoordinateService, public cdr: ChangeDetectorRef, public fds: FeedDisplayService) {
    // this.currentIsseuDetailId =  fds.getcurrentactive();
  }

  updateIcon(rectangles: { y: number; height: number }[]): { lowest: number; highest: number; difference: number } { //firstrefrence, highestY
    const rects = rectangles?.filter(a => a.y) || []
    if (rects.length === 0) {
      return { lowest: 0, highest: 0, difference: 0 };
    }

    let { lowest, highest } = rects?.reduce((acc, rect) => ({
      lowest: Math.min(acc.lowest, rect.y),
      highest: Math.max(acc.highest, rect.y)
    }), { lowest: rects[0].y, highest: rects[0].y });

    let difference = (highest - lowest) + rects[0].height;

    if (rects.length === 1) {
      lowest = lowest - 30;
    }

    if (difference < 60) {
      difference = 60;
    }


    // if (firstrefrence) {
    //   difference = highestY;
    // }

    return { lowest, highest, difference };
  }



  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    if (changes['timestamp']) {
      this.showhide = false;
      setTimeout(() => {
        this.showhide = true;
        this.cdr.detectChanges();
        (this.showhide)
      }, 10);
    }

    if (changes['currentIsseuDetailId']) {
      this.cdr.detectChanges();
    }




    if (changes['nEditid'] && changes['nEditid']?.firstChange && changes['nEditid']?.currentValue > 0) {
      this.cdr.detectChanges();
    }
    if (changes['annotations']) {
      // debugger;
      if (this.annotations && this.annotations.length > 0) {
        this.updatesCordinates()
      }
      this.cdr.detectChanges();
    }
    if (changes['selectedFont']) {
      //  console.warn('annotations changed from selectedFont',this.annotations.length,this.selectedFont)



      if (this.annotations && this.annotations.length > 0) {

        this.updatesCordinates()
      }
      this.cdr.detectChanges();
    }


  }




  openDetail(x) {
    this.fds.currentIsseuDetailId = x.nIDid;
    this.cdr.detectChanges();
    this.OnIconClick.next(x);
  }

  updatesCordinates() {
    debugger;
    // console.log('updatesCordinates = ',this.annotations.length)

    this.annotations.forEach((a: Annotation) => {
      //  if(!a?.bTrf)
      //   return;


      // if (a?.bTrf) { //this.fds.sd.cProtocol == 'C' && !
      //   return
      // }

      // let pageIndex = a.pageIndex ? a.pageIndex : -1;


      a.cordinates.forEach((b, index) => {

        /*if (b["p"]) {
          if (pageIndex != b["p"]) {
            //console.error('multiple return '+a.nIDid)
            return;
          }
        }*/
        let ln = a.cordinates.length;
        // if(ln==1)
        this.getCordinates(b, a.cordinates.length, index)

      })
    })
  }

  getCordinates(rect: any, ln: number, index: number) {

    try {
      if (!rect.text)
        return
      const lnInd = this.lines.findIndex(a => a.time == rect.t && ((a.unicid == 0 || a.unicid == rect.identity) || this.fds.sd.cProtocol == 'C'));
      if (lnInd > -1 && this.fds?.sd?.cProtocol != 'C') {
        if (this.mode != 'T') {
          rect.l = lnInd + 1;
        }
        try {
          this.data.isBold = this.lines[lnInd].formate == 'QES' || this.lines[lnInd].formate == 'QES-CONTINUE' || this.lines[lnInd].isBold
        } catch (error) {
        }
      } else {
        try {
          this.data.isBold = this.lines[rect.l - 1].formate == 'QES' || this.lines[rect.l - 1].formate == 'QES-CONTINUE' || this.lines[rect.l - 1].isBold
        } catch (error) {

        }
      }

      let curline = this.lines[rect.l - 1] //this.getLineText(rect.t)
      if (curline)
        this.data.destination = curline.lines.join('')
      this.data.search = rect.text;

      // let cordinates = this.calculateCoordinates(calculateLast);
      let cordinates = this.textCoordinateService.calculateTextCoordinates(this.selectedFont.name, this.data, index, ln);
      // alert(JSON.stringify(cordinates))
      let newY = (rect.l - 1) * this.y_height + this.y_offset
      //console.log('cordinates = ',cordinates,'y=',rect.y,'newY=',newY)
      rect.x = index == 0 ? cordinates.x : 108;
      rect.width = cordinates.width
      rect.y = newY
      //return cordinates
      // alert(JSON.stringify(rect))
    } catch (error) {

      console.log('error at getCordinates() = ', error);

    }
  }

  updatexy(rect, x) {

  }


  getLineText(timestamp) {
    //alert(320)

    return this.lines.find(a => a.time == timestamp && a.line)
  }
  calculateCoordinates(calculateLast) {
    //  alert(23)
    /*this.startIndex = -1;
    this.lastIndex = -1;
      
      let searchWords = this.data.search.split(' ');
    
      // Find start index
      for (let word of searchWords) {
        this.startIndex = this.data.destination.indexOf(word);
        if (this.startIndex !== -1) {
          break; // Exit the loop once a match is found
        }
      }
    
      // Find last index
      if(calculateLast){
        searchWords = this.data.search.split(' ').reverse(); // Reverse the search words
        for (let word of searchWords) {
          this.lastIndex = this.data.destination.lastIndexOf(word);
          if (this.lastIndex !== -1) {
            this.lastIndex += word.length - 1; // Adjust lastIndex to point to end of matched word
            break; // Exit the loop once a match is found
          }
        
          // Find last index
          if(calculateLast){
            searchWords = this.data.search.split(' ').reverse(); // Reverse the search words
            for (let word of searchWords) {
              this.lastIndex = this.data.destination.lastIndexOf(word);
              if (this.lastIndex !== -1) {
                this.lastIndex += word.length - 1; // Adjust lastIndex to point to end of matched word
                break; // Exit the loop once a match is found
              }
            }
          
          }else{
           
            this.lastIndex = this.data.destination.length - this.startIndex
          }
        
          if (this.startIndex !== -1 && this.lastIndex !== -1) {
           // console.log(this.data.search,this.data.destination)
           return this.startCoordinates = this.textCoordinateService.calculateTextCoordinates(this.selectedFont.name,this.data.destination, this.startIndex, this.lastIndex);
            //this.endCoordinates = this.textCoordinateService.calculateTextCoordinates(this.data.destination, this.lastIndex, this.data.search.length);
            //console.log('Start coordinates:', this.startCoordinates, 'End coordinates:', this.endCoordinates);
          } else {
            console.log("No matching word found in destination.");
            return { x: 108, y: 0, width: 0, endX: 0 };
          }*/
  }


  elementLoad(e, annotation) {
    debugger;
    const iconVal = this.updateIcon(annotation.cordinates);
    e.setAttribute('y', iconVal.lowest)


    const originalLength = annotation.orgCordinates?.length;
    const updatedLength = annotation.cordinates?.length;

    const lineHeight = 24;
    let totalLineHeight = annotation.orgCordinates?.length * lineHeight;
    if (updatedLength != originalLength) {
      try {
        const remainLength = originalLength - updatedLength;
        const pageSpaces = (Math.floor((remainLength - 1) / 25) + 1)
        totalLineHeight += (pageSpaces * 84)
      } catch (error) {

      }
    }
    e.setAttribute('height', totalLineHeight > 60 ? totalLineHeight : 60)
    // , iconVal.difference + (annotation?.pageCount && annotation?.pageCount > 1 ? (annotation.pageCount - 1) * 84 : 0)
  }
}
