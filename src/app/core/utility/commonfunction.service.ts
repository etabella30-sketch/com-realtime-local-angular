import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { DialogueComponent } from '../../shared/components/dialogue/dialogue.component';
import { MatDialog } from '@angular/material/dialog';
import moment from 'moment';
import { DomSanitizer } from '@angular/platform-browser';
import { highlightModeType } from '../../pdf/interfaces/pdf.interface';

interface intials {
  Fn: string;
  Ln: string;
  bg: string;
}
@Injectable({
  providedIn: 'root'
})
export class CommonfunctionService {
  colorMap = {
    "bg-slate-500": ["A", "N"],
    "bg-gray-800": ["B", "O"],
    "bg-zinc-600": ["C", "P"],
    "bg-neutral-800": ["D", "Q"],
    "bg-stone-600": ["E", "R"],
    "bg-red-600": ["F", "S"],
    "bg-brand": ["G", "T"],
    "bg-amber-600": ["H", "U"],
    "bg-lime-700": ["I", "V"],
    "bg-green-700": ["J", "W"],
    "bg-emerald-600": ["K", "X"],
    "bg-teal-500": ["L", "Y"],
    "bg-cyan-600": ["M", "Z"]
  }
  constructor(public router: Router, public dialog: MatDialog, private sanitizer: DomSanitizer) { }

  async get_userinit(x): Promise<intials> {
    try {
      var f1 = '';
      var f2 = '';
      if (x.cFname && x.cFname != '') {
        f1 = x.cFname.substring(0, 1).toUpperCase()
      }
      if (x.cLname && x.cLname != '') {
        f2 = x.cLname.substring(0, 1).toUpperCase()
      }
      if (f1) {
        var bg: any = this.initialcolor(f1);
      };
      return { Fn: f1.toString(), 'Ln': f2, 'bg': bg };
    } catch (error) {
      return null;
    }
  }

  initialcolor(initial) {
    for (const [color, letters] of Object.entries(this.colorMap)) {
      if (letters.includes(initial.toUpperCase())) {
        return color;
      }
    }
    return 'bg-orange-600';
  }

  goto(path, mdl?) {
    if (mdl && mdl != '' && Object.keys(mdl)) {

      var url: any = btoa(JSON.stringify(mdl));
      this.router.navigate([path, url], { relativeTo: null });
    } else {
      this.router.navigate([path]);
    }
  }





  opendialog(type, head, desc, button1, button2?, checkbox?) {
    const dialogRef = this.dialog.open(DialogueComponent, {
      width: 'fit-content',
      minWidth: '500px',
      height: 'fit-content',
      data: {
        'type': type, // 'I'
        'heading': head,
        'desc': desc,
        'button1': button1 ? button1 : '',
        'button2': button2 ? button2 : '',
        'checkbox': checkbox ? checkbox : '',
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(result);
    })
  }


  getCurrentTime(): string {
    return moment().format();  // Moment uses the system's local timezone by default
  }




  pointIntersectsRect = (x, y, rect) => {
    return y >= rect.top && y <= rect.bottom && x >= rect.left && x <= rect.right;
  }

  findSVGAtPoint = (x, y) => {

    let elements = document.querySelectorAll("g[isannotation]");
    if (elements && elements.length) {
      for (let i = 0, l = elements.length; i < l; i++) {
        let el = elements[i];
        let rect = el.getBoundingClientRect();
        if (this.pointIntersectsRect(x, y, rect)) {
          return el;
        }
      }
    }
    return null;
  }


  senitizeUrl(path: string, nBundledetailid: string, nCaseid: string, isFullmode?: boolean, isLink?: highlightModeType, pageNo?: number, isRealtime?: boolean,
    compareMode?: boolean, compareIndex?: number, linkExplorerMode?: string, linkExplorerType?: string, nRFSid?: number, nRDocid?: number, nRWebid?: number, isMyfile?: boolean) {

    return this.sanitizer.bypassSecurityTrustResourceUrl(`viewer/pdf/${btoa(path)}?nBundledetailid=${nBundledetailid}&nCaseid=${nCaseid}&fullmode=${isFullmode ? 'Y' : 'N'}&isLink=${isLink ? isLink : 'N'}&page=${pageNo ? pageNo : 1}&isRealtime=${isRealtime ? 'Y' : 'N'}&compareMode=${compareMode ? 'Y' : 'N'}&compareIndex=${compareIndex ? compareIndex : 0}&linkExplorerMode=${linkExplorerMode ? linkExplorerMode : ''}&linkExplorerType=${linkExplorerType ? linkExplorerType : ''}&nRFSid=${nRFSid || 0}&nRDocid=${nRDocid || 0}&nRWebid=${nRWebid || 0}&isMyfile=${isMyfile || false}`);
  }

  senitizeUrlObject(path: string, nBundledetailid: string, nCaseid: string, isFullmode?: boolean, isLink?: highlightModeType, pageNo?: number, isRealtime?: boolean,
    compareMode?: boolean, compareIndex?: number, linkExplorerMode?: string, linkExplorerType?: string, nRFSid?: number, nRDocid?: number, nRWebid?: number, isMyfile?: boolean) {
    return {path:path,
      nBundledetailid, nCaseid, fullmode: isFullmode ? 'Y' : 'N', isLink: isLink ? isLink : 'N', page: pageNo ? pageNo : 1, isRealtime: isRealtime ? 'Y' : 'N', compareMode: compareMode ? 'Y' : 'N',
      compareIndex: compareIndex ? compareIndex : 0,
      linkExplorerMode: linkExplorerMode ? linkExplorerMode : '', linkExplorerType: linkExplorerType ? linkExplorerType : '', nRFSid: nRFSid || 0, nRDocid: nRDocid || 0, nRWebid: nRWebid || 0, isMyfile: isMyfile || false
    }
  }

}
