import { Injectable } from '@angular/core';
import { PDFAnnotation, PDFPageViewport, PDFrects, iconsGroup, temporaryAnnots, uuidGroup } from '../interfaces/pdf.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable({ providedIn: 'root' })
export class PdfService {


  private readonly SVG_NS = 'http://www.w3.org/2000/svg';
  private readonly SVG = document.createElementNS(this.SVG_NS, 'svg');
  private readonly G_NODE = document.createElementNS(this.SVG_NS, 'g');
  private readonly RECT_NODE = document.createElementNS(this.SVG_NS, 'rect');
  private readonly LINE_NODE = document.createElementNS(this.SVG_NS, 'line');
  private readonly PATH_NODE = document.createElementNS(this.SVG_NS, 'path');
  private readonly foreignObject_NODE = document.createElementNS(this.SVG_NS, 'foreignObject');
  private readonly UPPER_REGEX = /[A-Z]/g;
  private readonly REGEX_HASHLESS_HEX = /^([a-f0-9]{6}|[a-f0-9]{3})$/i;
  private readonly BLACKLIST = ['viewBox'];
  private readonly isFirefox = /firefox/i.test(navigator.userAgent);
  private readonly defaultColor = '#0066FF';
  private readonly factSvg: string = 'assets/icon/fact.svg';
  private readonly QfactSvg: string = 'assets/icon/qfact.svg';
  private readonly docSvg: string = 'assets/icon/doc.svg';
  private readonly webSvg: string = 'assets/icon/web.svg';
  private readonly hiltSvg: string = 'assets/img/linktype H.svg';

  // core settings
  private readonly foreignObjSize: number = 60;
  private readonly iconXmargin: number = 0;
  private _penColor: string = '#0066FF';
  private _penSize: number = 1;
  public svgPath: any;
  public penAnnot: PDFAnnotation | null = null;
  private DEFAULT_HEIGHT_HYPERLINK_FOREIGN_OBJ = 15;
  constructor() {

  }

  getDefaultColor(): string {
    return this.defaultColor;
  }

  defaultSVG(): HTMLElement {
    return this.SVG.cloneNode(true) as HTMLElement;
  }

  defaultGNode(): HTMLElement {
    return this.G_NODE.cloneNode(true) as HTMLElement;
  }

  defaultRectNode(): HTMLElement {
    return this.RECT_NODE.cloneNode(true) as HTMLElement;
  }

  defaultLineNode(): HTMLElement {
    return this.LINE_NODE.cloneNode(true) as HTMLElement;
  }

  defaultPathNode(): HTMLElement {
    return this.PATH_NODE.cloneNode(true) as HTMLElement;
  }

  defaultForeignObjectNode(): HTMLElement {
    return this.foreignObject_NODE.cloneNode(true) as HTMLElement;
  }

  keyCase(key: string): string {
    if (!this.BLACKLIST.includes(key)) {
      key = key.replace(this.UPPER_REGEX, (match) => '-' + match.toLowerCase());
    }
    return key;
  }

  setPen(penSize: any = 1, penColor: string = '#000000') {
    this._penSize = Math.round(parseFloat(penSize) * 1e2) / 1e2;
    this._penColor = penColor;
  }

  transform(node: any, viewport: PDFPageViewport): HTMLElement {
    const trans = this.getTranslation(viewport);
    node.setAttribute('transform', `scale(1) rotate(${viewport.rotation}) translate(${trans.x}, ${trans.y})`);
    /* if (!this.isFirefox && node.nodeName.toLowerCase() === 'svg') {
      this.adjustNodeDimensions(node, viewport);
     }*/
    return node;
  }
  getAnnotationType(modeltype: any): string {
    if (['QF', 'F'].includes(modeltype)) {
      return 'highlight';
    }
    return modeltype === 'D' ? 'strikeout1' : 'strikeout';
  }


  convertToSvgRect = (rect: any, viewport: PDFPageViewport) => {
    let pt1 = [rect.x, rect.y];
    let pt2 = [rect.x + rect.width, rect.y + rect.height];

    pt1 = this.convertToSvgPoint(pt1, viewport);
    pt2 = this.convertToSvgPoint(pt2, viewport);

    return {
      x: Math.min(pt1[0], pt2[0]),
      y: Math.min(pt1[1], pt2[1]),
      width: Math.abs(pt2[0] - pt1[0]),
      height: Math.abs(pt2[1] - pt1[1])
    };
  }

  convertToSvgPoint = (pt: any, viewport: PDFPageViewport) => {

    viewport = viewport;// || this.getMetadata(svg).viewport;

    let xform = [1, 0, 0, 1, 0, 0];
    xform = this.scale(xform, viewport.scale, viewport.scale);
    xform = this.rotate(xform, viewport.rotation);

    let offset = this.getTranslation(viewport);
    xform = this.translate(xform, offset.x, offset.y);

    return this.applyInverseTransform(pt, xform);
  }
  scale = (m: any, x: any, y: any) => {
    return [
      m[0] * x,
      m[1] * x,
      m[2] * y,
      m[3] * y,
      m[4],
      m[5]
    ];
  };
  rotate = (m: any, angle: any) => {
    angle = angle * Math.PI / 180;

    let cosValue = Math.cos(angle);
    let sinValue = Math.sin(angle);

    return [
      m[0] * cosValue + m[2] * sinValue,
      m[1] * cosValue + m[3] * sinValue,
      m[0] * (-sinValue) + m[2] * cosValue,
      m[1] * (-sinValue) + m[3] * cosValue,
      m[4],
      m[5]
    ];
  };
  translate = (m: any, x: any, y: any) => {
    return [
      m[0],
      m[1],
      m[2],
      m[3],
      m[0] * x + m[2] * y + m[4],
      m[1] * x + m[3] * y + m[5]
    ];
  };

  getSelectionRects = () => {
    try {
      let selection: any = window.getSelection();
      let range = selection.getRangeAt(0);
      let rects = range.getClientRects();
      let pg;
      try {
        pg = parseInt(selection.focusNode.parentNode.closest('.page').getAttribute('data-page-number'))
      } catch (error) {

      }

      if (rects.length > 0 &&
        rects[0].width > 0 &&
        rects[0].height > 0) {
        return { rects: rects, page: pg, text: selection.toString() };
      }
    }
    catch (e) { }

    return null;
  }

  getAllSVGAnnots(SVG: SVGElement | SVGAElement | null) {
    return SVG ? SVG.querySelectorAll('[uuid]') : [];
  }

  pointIntersectsRect = (x, y, rect) => {
    return y >= rect.top && y <= rect.bottom && x >= rect.left && x <= rect.right;
  }

  getBoundingClientRect(element: any) {
    const rect = element.getBoundingClientRect();
    return {
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      x: rect.x,
      y: rect.y
    };
  }
  // findSVGAtPoint = (x: number, y: number, svg: SVGAElement | null) => {
  //   const elements: any = this.getAllSVGAnnots(svg);

  //   if (elements && elements.length) {
  //     for (let i = 0, l = elements.length; i < l; i++) {
  //       let el = elements[i];
  //       let rect = el.getBoundingClientRect();

  //       if (this.pointIntersectsRect(x, y, rect)) {
  //         return el;
  //       }



  //       try {
  //         if (el.children && el.children.length) {
  //           for (let m = 0; el.children.length > m; m++) {
  //             let rect = el.children[m].getBoundingClientRect();
  //             if (rect) {
  //               if (this.pointIntersectsRect(x, y, rect)) {
  //                 return el;
  //               }
  //             }

  //           }
  //         }
  //       } catch (error) {

  //       }



  //     }
  //   }

  //   return null;
  // }

  clearSelect() {
    var document: any;
    var sel = window.getSelection ? window.getSelection() : document.selection;
    if (sel) {
      if (sel.removeAllRanges) {
        sel.removeAllRanges();
      } else if (sel.empty) {
        sel.empty();
      }
    }
  }

  applyInverseTransform = (p: any, m: any) => {
    let d = m[0] * m[3] - m[1] * m[2];
    return [
      (p[0] * m[3] - p[1] * m[2] + m[2] * m[5] - m[4] * m[3]) / d,
      (-p[0] * m[1] + p[1] * m[0] + m[4] * m[1] - m[5] * m[0]) / d
    ];
  };
  getTranslation(viewport: PDFPageViewport): { x: number; y: number } {
    const { rotation, width, height, scale } = viewport;
    const rotations: { [key: number]: { x: number; y: number } } = {
      0: { x: 0, y: 0 },
      90: { x: 0, y: -width / scale },
      180: { x: -width / scale, y: -height / scale },
      270: { x: -height / scale, y: 0 },
    };
    return rotations[rotation % 360];
  }

  setAttributes(node: HTMLElement, attributes: Record<string, string | number>): void {
    try {
      Object.keys(attributes).forEach((key) => {
        if (!Number.isNaN(attributes[key]))
          node.setAttribute(this.keyCase(key), String(attributes[key]));
      });
    } catch (error) {

    }
  }

  normalizeColor(color: string): string {
    return this.REGEX_HASHLESS_HEX.test(color) ? `#${color}` : color;
  }

  /// RENDERING ANNOTATIONS
  createRect(r: PDFrects): HTMLElement {
    const rect = this.defaultRectNode();
    const attributes = { x: r.x, y: r.y, width: r.width, height: r.height, ...(r.index && { index: r.index }), ...(r.fill && { fill: r.fill }) };
    this.setAttributes(rect, attributes);
    return rect;
  }

  async renderWavyUnderline(a: PDFAnnotation): Promise<HTMLElement> {
    const path = this.defaultPathNode();
    const d: any = [];
    const amplitude = 1; // Amplitude of the wave
    const frequency = 4; // Frequency of the wave

    if (a.rects?.length) {
      a.rects.forEach(rect => {
        const { x, y, width } = rect;
        for (let i = 0; i <= width; i += 1) {
          const waveY = y + amplitude * Math.sin((i * frequency * Math.PI) / 10);
          d.push(`${i === 0 ? 'M' : 'L'}${x + i} ${waveY}`);
        }
      });
    }

    this.setAttributes(path, {
      d: d.join(' '),
      uuid: a.uuid,
      isTemp: String(a.isTemp || false),
      stroke: this.normalizeColor(a.color || '#000'),
      strokeWidth: a.width || 1,
      fill: 'none',
      style: 'scale:calc(var(--scale-factor) * 1)'
    });

    return path;
  }


  async renderLine(a: PDFAnnotation): Promise<HTMLElement> {
    const group = this.defaultGNode();
    const strokeColor = this.normalizeColor(a.color || '#f00');
    const attributes: Record<string, string | number> = a.type === 'strikeout'
      ? { uuid: a.uuid, isTemp: String(a.isTemp || false), stroke: strokeColor, strokeWidth: 1, style: 'scale:calc(var(--scale-factor) * 1)' }
      : { uuid: a.uuid, isTemp: String(a.isTemp || false), stroke: strokeColor, strokeWidth: '1.35', 'stroke-dasharray': '1.35', style: 'scale:calc(var(--scale-factor) * 1)' };
    this.setAttributes(group, attributes);
    a.rects?.forEach(r => {
      const line = this.defaultLineNode();
      const cords = { x1: r.x, y1: r.y, x2: r.x + r.width, y2: r.y };
      this.setAttributes(line, cords);
      group.appendChild(line);

      try {
        if (r.bundledetailid)
          this.setAttributes(group, { bundledetailid: r.bundledetailid, hyperlink: "Y" });

        if (r.redirectpage)
          this.setAttributes(group, { redirectpage: r.redirectpage, hyperlink: "Y" });

        if (r.redirectpage2)
          this.setAttributes(group, { redirectpage2: r.redirectpage2, hyperlink: "Y" });

      } catch (error) {

      }
      if (a.isHyperlink) {
        const foreignObject = this.defaultForeignObjectNode();
        this.setAttributes(foreignObject, { isHyperlink: 'Y', uuid: a.uuid, x: r.x, y: (r.y - this.DEFAULT_HEIGHT_HYPERLINK_FOREIGN_OBJ), width: r.width, height: this.DEFAULT_HEIGHT_HYPERLINK_FOREIGN_OBJ });
        group.appendChild(foreignObject);
      }

    });
    return group;
  }

  async renderPath(a: PDFAnnotation): Promise<HTMLElement> {
    const path = this.defaultPathNode();
    const d = [];

    if (a.lines?.length) {
      d.push(`M${a.lines[0][0]} ${a.lines[0][1]}`);
      for (let i = 1; i < a.lines.length; i++) {
        const p1 = a.lines[i];
        d.push(`L${p1[0]} ${p1[1]}`);
      }
    }

    this.setAttributes(path, {
      d: d.join(' '),
      uuid: a.uuid,
      isTemp: String(a.isTemp || false),
      stroke: this.normalizeColor(a.color || '#000'),
      strokeWidth: a.width || 1,
      strokeMiterlimit: 0,
      fill: 'none',
      strokeDasharray: (a as { "stroke-dasharray"?: string })?.["stroke-dasharray"] || 0,
      style: 'scale:calc(var(--scale-factor) * 1)'
    });

    return path;
  }

  async fetchAnnotaitonStructure(annotation: PDFAnnotation[], viewport: PDFPageViewport): Promise<HTMLElement[]> {
    const gNodes = annotation.map(async (ant) => {
      let nodeEl: HTMLElement | null = null;
      if (['highlight'].includes(ant.type)) {
        nodeEl = this.transform(await this.renderRect(ant), viewport);
      } else if (['area'].includes(ant.type)) {
        nodeEl = this.transform(await this.renderRect(ant), viewport);
      } else if (['strikeout1'].includes(ant.type)) {
        nodeEl = this.transform(await this.renderLine(ant), viewport);
      } else if (['strikeout', 'underline'].includes(ant.type)) {
        nodeEl = this.transform(await this.renderLine(ant), viewport); //renderWavyUnderline
      } else if (ant.type === 'drawing') {
        nodeEl = this.transform(await this.renderPath(ant), viewport);
      }
      return nodeEl;
    });
    return (await Promise.all(gNodes)).filter(Boolean) as HTMLElement[];
  }

  async generateIcons(icons: iconsGroup[], viewport: PDFPageViewport): Promise<HTMLElement[]> {

    const gNodes = icons.map(async (icon) => {
      let nodeEl: HTMLElement | null = null;

      if (icon) {
        nodeEl = this.transform(await this.renderForeignObject(icon, viewport), viewport);
      }

      return nodeEl;
    });

    return (await Promise.all(gNodes)).filter(Boolean) as HTMLElement[];
  }

  async renderRect(a: PDFAnnotation): Promise<HTMLElement> {
    const group = this.defaultGNode();
    let attrs = { uuid: a.uuid, isTemp: String(a.isTemp || false), fill: (a.type == 'area' ? "transparent" : this.normalizeColor(a.color || '#ff0')), style: 'scale: calc(var(--scale-factor) * 1)' };
    if (a.type == 'area') {
      attrs["stroke-width"] = "2";
      attrs["stroke"] = "black";
      // delete attrs["style"];
    }
    this.setAttributes(group, attrs);
    a.rects?.forEach((r) => group.appendChild(this.createRect(r)));
    return group;
  }


  async renderForeignObject(icon: iconsGroup, viewport: PDFPageViewport): Promise<HTMLElement> {
    const group = this.defaultForeignObjectNode();
    const groupData: any[] = this.groupByLinkType(icon.uuids);
    const height = ((icon.maxY - icon.minY) > (groupData.length * this.foreignObjSize) ? (icon.maxY - icon.minY) : (groupData.length * this.foreignObjSize));
    const positionY = icon.minY + ((icon.maxY - icon.minY) / 2);
    const positionX = (viewport.rawDims.pageWidth + this.iconXmargin);
    this.setAttributes(group, { style: 'scale: calc(var(--scale-factor) * 1)', x: positionX, min: icon.minY, max: icon.maxY, y: positionY - (height / 2), pos: positionY, posmin: (height / 2), width: this.foreignObjSize, height: height }); // style: 'scale: calc(var(--scale-factor) * 1)', // + (((icon.maxY - icon.minY) / 2))


    group.innerHTML = await this.GenBubleIcon(groupData, icon.maxY - icon.minY);

    return group;
  }

  async GenBubleIcon(groupData: any[], height: number): Promise<string> {
    let strObj = `<div class="rightfloaticons" style="height: 100%;" >
          <hr style="height: ${height}px;" vertical >
          <hr id="verticalHR" horizontal>
          <div class="twobubblewrapper">
      `
    for (let x of groupData) {
      strObj += this.getIcon(x.linktype, x.ids, x.uuids, x.ids.length)
    }
    strObj += `</div></div>
   </div>`
    return String(strObj);
  }

  getIcon = (type: string, dbIds: number[], uuids: string[], number: number) => {
    let html = `<div data-icon ` + uuids.map(a => `icon-${a}`).join(' ');
    html = html + ` class="icons" db-ids="${dbIds ? dbIds.join(',') : ''}" icon-type="${type}"
                        style="box-shadow: rgba(148, 148, 148, 0.25) 0px 3px 10px;">
                      <img src="${type == 'F' ? this.factSvg : (type == 'QF' ? this.QfactSvg : (type == 'D' ? this.docSvg : (type == 'P' ? this.hiltSvg : this.webSvg)))}"
                            class="md hydrated">
                      <b class="num-counts">
                            <a class="onlynumcounts" style="display: inline;">${number} </a>
                      </b>
        </div>
    `
    return html;
  }

  ////////////////////////////////////////////////////////////////// GROUP BY RECTS

  rangesIntersect(y1: number, h1: number, y2: number, h2: number) {
    return (y1 < y2 + h2) && (y2 < y1 + h1);
  }

  getMinY(annotation: PDFAnnotation): number {
    const rectYValues = annotation.rects ? annotation.rects.map(rect => rect.y) : [];
    const lineYValues = annotation.lines ? annotation.lines.map(line => parseFloat(line[1])) : [];
    return Math.min(...rectYValues, ...lineYValues);
  }

  groupByYIntersections(data: PDFAnnotation[]) {
    // Filter out temporary annotations
    data = data.filter(a => !a.isTemp && !a.isHyperlink);


    // Sort the data by the minimum y-value
    data.sort((a, b) => this.getMinY(a) - this.getMinY(b));

    const groups: { uuids: { uuid: string, id: number, linktype: string }[], minY: number, maxY: number }[] = [];

    data.forEach(item => {
      const elements = (item.rects && item.rects.length) ? item.rects : item.lines?.map(line => ({ y: parseFloat(line[1]), height: Number(item.width) || 4 }));
      if (!elements) return;

      let groupFound = false;
      let minY = Math.min(...elements.map(el => el.y));
      let maxY = Math.max(...elements.map(el => el.y + el.height));

      for (const group of groups) {
        for (const member of group.uuids) {
          const memberItem = data.find((d: any) => d.uuid === member.uuid);
          if (!memberItem) continue;

          const memberElements = memberItem.rects || memberItem.lines?.map(line => ({ y: parseFloat(line[1]), height: Number(memberItem.width) || 4 }));
          if (memberElements?.some((memberElement: any) => elements.some(element => this.rangesIntersect(element.y, element.height, memberElement.y, memberElement.height)))) {
            group.uuids.push({ uuid: item.uuid, id: item.id, linktype: item.linktype });
            group.minY = Math.min(group.minY, minY);
            group.maxY = Math.max(group.maxY, maxY);
            groupFound = true;
            break;
          }
        }
        if (groupFound) break;
      }

      if (!groupFound) {
        groups.push({ uuids: [{ uuid: item.uuid, id: item.id, linktype: item.linktype }], minY, maxY });
      }
    });

    return groups.map(group => ({
      uuids: group.uuids,
      minY: group.minY,
      maxY: group.maxY
    }));
  }


  groupByLinkType(data: uuidGroup[]): uuidGroup[] {
    return data.reduce((acc: any, item: any) => {
      const { uuid, id, linktype } = item;
      let group = acc.find((g: uuidGroup) => g.linktype === linktype);

      if (!group) {
        group = { uuids: [], ids: [], linktype };
        acc.push(group);
      }

      group.uuids.push(uuid);
      group.ids.push(id);

      return acc;
    }, []);
  }


  generateRandomId(): string {
    return uuidv4();
  }

  async saveRect(type: string, pageNumber: number, rects: any[], color: string, viewport: PDFPageViewport, svg: SVGElement | null): Promise<PDFAnnotation | null> {
    if (!svg) {
      return Promise.reject({ msg: 'Svg not found' });
    }
    try {
      const boundingRect: any = svg.getBoundingClientRect();
      color = color || this.defaultColor;
      const rt = viewport.rotation
      const annotation: PDFAnnotation = {
        isTemp: true,
        id: 0,
        linktype: 'F',
        type,
        color,
        uuid: this.generateRandomId(),
        page: pageNumber,
        rects: [...rects].map((r) => {
          let offset = 0;
          if (type === 'strikeout' || type === 'strikeout1') {
            offset = ([90, 270].includes(rt) ? r.width : r.height);
          }
          return this.convertToSvgRect({
            y: (r.top + (rt == 0 ? offset : 0) - (rt == 180 ? offset : 0)) - boundingRect.top,
            x: r.left - boundingRect.left - (rt == 90 ? offset : 0) + (rt == 270 ? offset : 0),
            width: r.width,
            height: r.height
          }, viewport);
        }).filter((r) => r.width > 0 && r.height > 0 && r.x > -1 && r.y > -1)
      };


      if (!annotation.rects || !annotation.rects.length) {
        return Promise.reject({ msg: '0 Reactangles length' });
      }

      const annotElement: HTMLElement[] = await this.fetchAnnotaitonStructure([annotation], viewport);
      svg.append(...annotElement);

      return Promise.resolve(annotation);
    } catch (error) {
      return Promise.reject({ msg: 'Failed to annot', error });

    }

  }


  async savePoint(x: number, y: number, svg: SVGElement | null, viewport: PDFPageViewport | null, pageno: number, lines: any[]): Promise<void> {
    if (!svg || !viewport) return;
    const rect = svg.getBoundingClientRect();
    let point: any = this.convertToSvgPoint([
      x - rect.left,
      y - rect.top
    ], viewport);
    point[0] = point[0].toFixed(2);
    point[1] = point[1].toFixed(2);
    lines.push(point);
    if (lines.length <= 1) return;

    if (this.svgPath) svg.removeChild(this.svgPath);

    const annot: PDFAnnotation = {
      isTemp: true,
      id: 0,
      linktype: 'F',
      uuid: this.generateRandomId(),
      page: pageno,
      type: 'drawing',
      color: this._penColor,
      width: this._penSize,
      lines: lines
    };
    this.penAnnot = annot;
    const annotElement: HTMLElement[] = await this.fetchAnnotaitonStructure([annot], viewport);
    if (annotElement.length) {
      this.svgPath = annotElement[0];
      svg.append(...annotElement);
    }

  }

  getOffset(element: any) {
    const rect = element.getBoundingClientRect();
    return {
      top: rect.top + window.pageYOffset,
      left: rect.left + window.pageXOffset
    };
  }
  findAnnotInSVG(SVG: SVGElement | null, uuid: string) {
    return SVG ? SVG.querySelector(`[uuid="${uuid}"]`) : null;
  }

  removeByUUID(SVG: SVGElement | null, uuid: string) {
    const annot = this.findAnnotInSVG(SVG, uuid);
    if (annot) {
      SVG.removeChild(annot);
    }
  }

  findTemporaryAnnot(x, y, x2, y2, svg: any, tempAnnots: temporaryAnnots[]): Promise<any> {
    if (!svg) {
      return null;
    }
    const elements: any = this.getAllSVGAnnots(svg);

    const offset = svg.getBoundingClientRect();
    const point = svg.createSVGPoint();
    let findElement: any = null;

    for (let element of elements) {
      const uuid = element.getAttribute('uuid');
      const rect = this.getBoundingClientRect(element);

      const tempAnnot = tempAnnots.find((a) => a.annots.uuid == uuid);
      if (tempAnnot) {
        const annot = tempAnnot.annots;
        const hType = annot.type;
        if ("drawing" == hType) {
          try {
            const rotate = parseInt(element.getAttribute('transform').match(/rotate\((\d+)/)?.[1] || "0");



            var x_in = x2;
            var y_in = y2;
            if (rotate == 270) {
              x_in = (offset.height - y_in);
              y_in = x_in
            } else if (rotate == 90) {
              x_in = y_in;
              y_in = (offset.width - x_in);
            } else if (rotate == 180) {
              x_in = (offset.width - x_in);
              y_in = (offset.height - y_in);
            }
            let scaleFactor: any = getComputedStyle(svg).getPropertyValue('--scale-factor');
            point.x = x_in / scaleFactor;
            point.y = y_in / scaleFactor;
            if (element.isPointInStroke(point)) {
              findElement = element;
              break;
            }
          } catch (error) {
            console.error(error);
          }
        } else {
          try {
            if (["strikeout1", "strikeout"].includes(hType)) {
              rect.top = rect.top - 20;
              rect.bottom = rect.bottom + 10;
              rect.height = 20;
            }
          } catch (error) {
            console.error(error);
          }
          const elems = this.pointIntersectsRect(x, y, rect);
          if (elems) {
            findElement = element;
            break;
          }

        }
      }
    }

    return Promise.resolve(findElement);
  }


  findAnnotAtPoint(x, y, x2, y2, svg: any, globannots: PDFAnnotation[], isOnlyHyperlink?: boolean, isDocLinks?): Promise<any> {
    if (!svg) {
      return null;
    }
    const elements: any = this.getAllSVGAnnots(svg);
    const offset = svg.getBoundingClientRect();
    const point = svg.createSVGPoint();
    let findElement: any = null;
    for (let element of elements) {
      const uuid = element.getAttribute('uuid');
      const rect = this.getBoundingClientRect(element);
      const annot = globannots.find((a) => a.uuid == uuid && ((isOnlyHyperlink ? a.isHyperlink : false) || (isDocLinks ? a.linktype == 'D' : false)));
      if (annot) {
        const hType = annot.type;
        if ("drawing" == hType) {
          try {
            const rotate = parseInt(element.getAttribute('transform').match(/rotate\((\d+)/)?.[1] || "0");
            var x_in = x2;
            var y_in = y2;
            if (rotate == 270) {
              x_in = (offset.height - y_in);
              y_in = x_in
            } else if (rotate == 90) {
              x_in = y_in;
              y_in = (offset.width - x_in);
            } else if (rotate == 180) {
              x_in = (offset.width - x_in);
              y_in = (offset.height - y_in);
            }
            let scaleFactor: any = getComputedStyle(svg).getPropertyValue('--scale-factor');
            point.x = x_in / scaleFactor;
            point.y = y_in / scaleFactor;
            if (element.isPointInStroke(point)) {
              findElement = element;
              break;
            }
          } catch (error) {
            console.error(error);
          }
        } else {
          try {
            if (["strikeout1", "strikeout"].includes(hType)) {
              rect.top = rect.top - 20;
              rect.bottom = rect.bottom + 10;
              rect.height = 20;
            }
          } catch (error) {
            console.error(error);
          }
          const elems = this.pointIntersectsRect(x, y, rect);
          if (elems) {
            findElement = element;
            break;
          }

        }
      }
    }

    return Promise.resolve(findElement);
  }
  async buildSVG(viewport: PDFPageViewport, anotData: PDFAnnotation[], nFSid: number): Promise<HTMLElement> {
    const SVG: HTMLElement = this.defaultSVG();
    try {
      if (anotData.length) {
        const gNodes: HTMLElement[] = await this.fetchAnnotaitonStructure(anotData, viewport);
        if (gNodes.length) {
          if (!nFSid) {
            const matcherd: iconsGroup[] = this.groupByYIntersections(anotData);
            if (matcherd.length) {
              const icons: HTMLElement[] = await this.generateIcons(matcherd, viewport);
              gNodes.unshift(...icons);
            }
          }
          SVG.append(...gNodes)
        } else {
          console.error('ANNOTATION ARE INVALID HIGHLIGHT', anotData);
        }
      }
    } catch (error) {
    }
    return SVG as HTMLElement;
  }



  async buildHyperlinkSVG(viewport: PDFPageViewport, anotData: PDFAnnotation[]): Promise<HTMLElement[]> {
    const SVGs: HTMLElement[] = [];
    try {

      if (anotData.length) {
        const gNodes: HTMLElement[] = await this.fetchAnnotaitonStructure(anotData, viewport);
        if (gNodes.length) {
          /*  gNodes.forEach((g) => {
              const SVG: HTMLElement = this.defaultSVG();
              SVG.append(g)
              SVGs.push(SVG);
            });*/
          const SVG: HTMLElement = this.defaultSVG();
          this.setAttributes(SVG, { class: 'svg-uper' });
          // gNodes.forEach((g) => {
          //   const forgn = this.defaultForeignObjectNode();
          //   g.append(forgn);
          // })
          SVG.append(...gNodes)
          SVGs.push(SVG);
        } else {
          console.error('ANNOTATION ARE INVALID HIGHLIGHT', anotData);
        }
      }
    } catch (error) {
    }
    return SVGs;
  }


  elementScroll(element: HTMLElement) {
    if (!element) return;
    element.scrollIntoView({
      block: 'center', // aligns the element to the center of the viewport
      inline: 'center' // aligns the element to the center inline axis (horizontal alignment)
    })
  }
  /*
    findAllAnnotationAtPoint(x, y, x2, y2, svg: any, tempAnnots: temporaryAnnots[]): Promise<any> {
      if (!svg) {
        return null;
      }
      var filterres = [];
  
      // SVGPoint is deprecated according to MDN
      let point = svg.createSVGPoint();
  
      const elements: any = this.getAllSVGAnnots(svg);
  
      let offset = svg.getBoundingClientRect();
  
      for (let element of elements) {
        const uuid = element.getAttribute('uuid');
        // const hType = this.tempA
        var rect = this.getBoundingClientRect(element) //element.getBoundingClientRect();
  
        if (["drawing"].includes(element.getAttribute("data-pdf-annotate-type"))) {
          try {
            var trans = parseInt(element.getAttribute('transform').split(' ')[0].replace(/\D/g, ""));
            var rotate = parseInt(element.getAttribute('transform').split(' ')[1].replace(/\D/g, ""));
            // var bbox = element.getBBox();
            var actualsize = 100; // - 100;
            var x_in = x2;
            var y_in = y2;
            if (rotate == 270) {
              x_in = (offset.height - y_in);
              y_in = x_in
            } else if (rotate == 90) {
              x_in = y_in;
              y_in = (offset.width - x_in);
            } else if (rotate == 180) {
              x_in = (offset.width - x_in);
              y_in = (offset.height - y_in);
            }
            let scaleFactor: any = getComputedStyle(svg).getPropertyValue('--scale-factor');
            point.x = x_in / scaleFactor;
            point.y = y_in / scaleFactor;
            if (element.isPointInStroke(point)) {
              filterres.push(element);
            }
          } catch (error) {
          }
        } else {
          if (["strikeout1", "strikeout"].includes(element.getAttribute("data-pdf-annotate-type"))) {
            rect.top = rect.top - 20;
            rect.bottom = rect.bottom + 10;
            rect.height = 20;
          }
          var el = this.pointIntersectsRect(x, y, rect);
          if (el) {
            filterres.push(element);
          }
        }
      }
      return Promise.all(filterres);
    }*/

}
