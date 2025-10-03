import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, Output, SimpleChange } from '@angular/core';
import { FeedLineComponent } from '../../feed-line/feed-line.component';
import { hylightMD, hyperLinksMDL } from '../../../models/issue.interface';
import { annotIndex, tabmodel } from '../../../models/annotation.interface';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { FeedDisplayService } from '../../../services/feed-display.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-text-layer',
  standalone: true,
  imports: [CommonModule, FeedLineComponent, IconComponent],
  templateUrl: './text-layer.component.html',
  styleUrls: ['./text-layer.component.scss']
})

export class TextLayerComponent {
  @Input() lines: any;
  @Input() pageno: any;
  @Input() showTimestamp: boolean = false;
  @Input() highlightmode: hylightMD = false;
  @Input() hyperlinks: hyperLinksMDL[] = [];
  @Input() hyperlinksicons: any = [];
  @Input() nEditid:any;
  @Input() isSetupscreen: boolean = false;
  @Input() selectedFont: any;
  @Input() annotations: any = [];
  @Output() OnIconClick = new EventEmitter<any>();
  zoomLevel: any = 1;
  highlightsIndex: annotIndex[] = [];
  highlightedLines: { index: number, element: HTMLElement, color: string }[] = [];
  iconsPositions: any[] = []; // Add a property to store icon positions

  @Input() mode: string = 'L';
  @Output() onTabEvent = new EventEmitter<tabmodel>();
  @Input() onReceiveEvent: Subject<any>;
  @Input() spaceBarOptions:any = {};
  constructor(private cdr: ChangeDetectorRef, public fds: FeedDisplayService) { }


  trackByLine(index: number, item: any): number {
    return item?.lineIndex || index;
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    
    if (changes['hyperlinks']) {
      // console.log('hyperlinks changed')
      // if(this.hyperlinks.length>0){
      // 
      // }
      this.initHyperlinks();
      // this.updateIconsPositions();
      this.updateIconData(this.hyperlinks);
    }
    if (changes['annotations']) {

      this.createHighlightIndexs();
    }
    if (changes['lines']) {

      this.cdr.detectChanges();
    }
  }

  createHighlightIndexs() {
    if (!this.annotations?.length) return;
    this.lines?.map(a => a.annots = []);
    for (const { color, nIDid, cordinates } of this.annotations) {
      if (!cordinates?.length) continue;

      for (const { l, s, ln } of cordinates) {
        const lineIndex = l - 1;
        const line = this.lines[lineIndex];
        if (line) {
          if (!line.annots) {
            line.annots = [];
          }

          line.annots.push({ s, ln, color, nIDid });
        }
      }
    }
    // this.lines = [...this.lines];

    this.cdr.detectChanges();
  }

  ngOnInit(): void {
    this.initHyperlinks();
  }

  initHyperlinks() {
    this.lines?.map(a => a.isHilighted = false);
    if (this.hyperlinks && this.hyperlinks.length) {
      for (let x of this.hyperlinks) {
        try {
          // if (this.lines.length > x.cLineno) {
          this.lines[Number(x.cLineno) - 1].isHilighted = true;
          this.lines[Number(x.cLineno) - 1].nHid = x.nHid;
          this.lines[Number(x.cLineno) - 1].cColor = x.cColor;
          // }
        } catch (e) { console.error('initHyperlinks error', e) }
      }
      this.cdr.detectChanges();
    }
  }



  onLineSelect(event: { index: number, element: HTMLElement, color: string, nHid: number, type: string, hyperLinkData: any[] }) {
   
    try {
      if (event.type == 'A') {
        const newHighlight = {
          nHid: event.nHid, // Example ID generation
          cPageno: this.pageno,
          cLineno: event.index,
          cTime: new Date().toLocaleTimeString(),
          cColor: event.color
        };

        // Update the hyperlinks array with the new highlight
        const newHyperlinks = [...this.hyperlinks, newHighlight];
        this.updateHyperlinks(newHyperlinks);
        // this.updateIconsPositions();
        // this.updateIconData(this.hyperlinks);
        // this.cdr.detectChanges();
      }

      else {
        let newHyperlinks;
        const existingHighlightIndex = this.hyperlinks.findIndex(
          (highlight) => parseInt(highlight.cLineno, 10) === event.index
        );

        if (existingHighlightIndex > -1) {
          // Remove the existing highlight
          newHyperlinks = [
            ...this.hyperlinks.slice(0, existingHighlightIndex),
            ...this.hyperlinks.slice(existingHighlightIndex + 1)
          ];
          this.updateHyperlinks(newHyperlinks);
          // this.updateIconsPositions();
          // this.updateIconData(this.hyperlinks);
          // this.cdr.detectChanges();
        }
      }

    } catch (error) {

    }

    event.hyperLinkData;

    // if (event.hyperLinkData?.length) {

    // this.updateIconData(event.hyperLinkData ? event.hyperLinkData : []);
    // }
    return;
  }

  updateHyperlinks(newHyperlinks) {
    var sortedhyperlink = newHyperlinks.sort((a, b) => a.index - b.index);
    this.hyperlinks = sortedhyperlink;
    this.cdr.detectChanges(); // Trigger change detection after updating hyperlinks
  }




  // getIconsPositions(): any[] {
  //   let positions: any[] = [];
  //   let groupStart = null;
  //   let groupEnd = null;
  //   let groupHeight = 0;
  //   let groupColor = null;

  //   for (let i = 0; i < this.highlightedLines.length; i++) {
  //     if (groupStart === null) {
  //       groupStart = this.highlightedLines[i];
  //       groupEnd = this.highlightedLines[i];
  //       groupHeight = 24; // Each element is 24px high
  //       groupColor = this.highlightedLines[i].color;
  //     } else if (this.highlightedLines[i].index === groupEnd.index + 1 && this.highlightedLines[i].color === groupColor) {
  //       groupEnd = this.highlightedLines[i];
  //       groupHeight += 24; // Add height of the current element
  //     } else {
  //       positions.push({
  //         top: (groupStart.index - 1) * 24 + 60, // Calculate top position
  //         height: groupHeight,
  //         color: groupColor
  //       });
  //       groupStart = this.highlightedLines[i];
  //       groupEnd = this.highlightedLines[i];
  //       groupHeight = 24; // Reset group height
  //       groupColor = this.highlightedLines[i].color;
  //     }
  //   }

  //   if (groupStart !== null) {
  //     positions.push({
  //       top: (groupStart.index - 1) * 24 + 60, // Calculate top position
  //       height: groupHeight,
  //       color: groupColor
  //     });
  //   }

  //   return positions;
  // }

  updateIconsPositions() {
    this.updateIconData(this.hyperlinks);
    // this.iconsPositions =  this.getIconsFromHyperlinks();
    this.cdr.detectChanges(); // Trigger change detection after updating positions
  }


  updateIconData(listData: any = []) {
    return;
    if (listData?.length > 0) {

      const groups = [...new Set(listData.map(a => (Number(a.nGroupid))))]

      const iconData = groups.map(a => {
        try {
          const filterdData = listData.filter(b => Number(b.nGroupid) == a);
          if (!filterdData.length) return null;
          const min = Math.min(...filterdData.map(a => Number(a.cLineno)));
          const top = (min - 1) * 24 ;
          const height = filterdData.length * 24;
          return { top, height, issues: (filterdData[0]["issueids"] ? filterdData[0]["issueids"].split(',') : null), hIds: filterdData.map(a => a.nHid), page: this.pageno };
        } catch (error) {
          return null;
        }
      });

      this.iconsPositions = iconData.filter(a => a && a.issues);

    } else {
      this.iconsPositions = [];
    }
    this.cdr.detectChanges();
  }

  getIconsFromHyperlinks(): any[] {
    let positions: any[] = [];
    let currentGroup: any[] = [];
    let attachedIndices: number[] = [];

    // Sort hyperlinks by line index
    const sortedHyperlinks = [...this.hyperlinks].sort((a, b) =>
      parseInt(a.cLineno, 10) - parseInt(b.cLineno, 10)
    );

    for (let i = 0; i < sortedHyperlinks.length; i++) {
      const hyperlink = sortedHyperlinks[i];
      const lineIndex = parseInt(hyperlink.cLineno, 10);
      const color = hyperlink.cColor;

      // Skip entries without color (like the second item in your example)
      if (!color) continue;

      if (currentGroup.length === 0 ||
        lineIndex !== currentGroup[currentGroup.length - 1].lineIndex + 1 ||
        color !== currentGroup[currentGroup.length - 1].color) {
        // Start a new group if:
        // - It's the first hyperlink
        // - The line is not consecutive
        // - The color is different
        if (currentGroup.length > 0) {
          // Push the previous group
          positions.push(this.createPositionObject(currentGroup, attachedIndices));
        }
        currentGroup = [{ lineIndex, color }];
        attachedIndices = [lineIndex];
      } else {
        // Continue the current group
        currentGroup.push({ lineIndex, color });
        attachedIndices.push(lineIndex);
      }
    }

    // Push the last group if it exists
    if (currentGroup.length > 0) {
      positions.push(this.createPositionObject(currentGroup, attachedIndices));
    }

    return positions;
  }

  private createPositionObject(group: any[], indices: number[]): any {
    return {
      top: (group[0].lineIndex - 1) * 24 + 60,
      height: group.length * 24,
      color: group[0].color,
      attachedIndices: [...indices]
    };
  }

  openDetail(x) {
   
    this.fds.currentIsseuDetailId = null;
    this.fds.currentHdetailId = x.hIds;
    this.cdr.detectChanges();
    this.OnIconClick.emit({ event: 'HiconClick', data: x });
  }

  OnTabEvent(e){
    this.onTabEvent.next(e)

  }

}
