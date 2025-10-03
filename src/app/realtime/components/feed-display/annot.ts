import { TostbarService } from "../../../core/services/tost/tostbar.service";
import { Annotation } from "../../models/annotation.interface";
import { hylightMD } from "../../models/issue.interface";
import { AnnotationService } from "../../services/annotation/annotation.service";
import { FeedDisplayService } from "../../services/feed-display.service";
import { IssueService } from "../../services/issue/issue.service";


interface FeedEntry {
    time: string;
    asciiValue: number[];
    lines: string[];
    oPage: number;
    oLine: number;
    unicid: string;
    // …etc.
}

interface FeedPage {
    msg: number;
    page: number;
    data: FeedEntry[];
    // …et
}



interface issueCordinates {
    x: number;
    y: number;
    width: number;
    height: number;
    t: string;
    l: number;
    p: number;
    text: string;
    oP: number;
    oL: number
    identity: string;
}

export class PerformAnnotComponent {

    constructor(protected fds: FeedDisplayService,
        protected annotationService: AnnotationService,
        protected issueServer: IssueService,
        protected tost: TostbarService

    ) {

    }


    private isFirstElementSet = false;


    private isSelection = true;
    private firstLineObj = {
        text: null,
        element: null,
        isFirstSelected: false,
        page: null,
        line: null
    }

    resetSelection() {
        this.firstLineObj = {
            text: null,
            element: null,
            isFirstSelected: false,
            page: null,
            line: null
        }
    }

    OnSelectionStart(e) {
        this.isSelection = true;
        this.resetSelection();
    }

    onAnnotPerform() {
        this.isSelection = false;
        debugger;

        if (this.gethighlightmode() != 'I') {

            this.resetSelection();
            return;
        }

        const sel = window.getSelection();
        if (!sel || sel.isCollapsed) return;
        // if (!this.firstLineObj?.page) return;

        // helper: from any Node → your nearest .line element
        const findLineElem = (node) => {
            if (!node) return null;
            return node.nodeType === 3
                ? node.parentElement.closest('.line')
                : node.closest('.line');
        };

        const endLineObj = {
            text: null,
            element: null,
            isFirstSelected: false,
            page: null,
            line: null
        }

        const string = sel.toString().trim();

        endLineObj.text = string.split('\n')[string.split('\n').length - 1];
        endLineObj.element = findLineElem(sel.focusNode);
        if (endLineObj.element) {
            endLineObj.page = endLineObj.element?.getAttribute("pno")
            endLineObj.line = endLineObj.element?.getAttribute("lno")
            endLineObj.isFirstSelected = true;
        }
        debugger;


        if (!endLineObj.page) return;
        if (!this.firstLineObj?.page) {
            this.firstLineObj = { ...endLineObj }
        };

        const startCount = this.firstLineObj.page * 25 + (Number(this.firstLineObj.line) - 1);

        const endCount = endLineObj.page * 25 + (Number(endLineObj.line) - 1);

        if (startCount == -1 || endCount == -1) return;

        let startObj, endObj;
        if (endCount > startCount) {

            startObj = this.firstLineObj;                     // {page, line, …}
            endObj = endLineObj;
        } else {

            startObj = endLineObj;                     // {page, line, …}
            endObj = this.firstLineObj;
        }
        // {page, line, …}


        const feedData = this.fds.getActiveFeedData();

        const feedValue = feedData.filter(x => x.page >= startObj.page && x.page <= endObj.page);




        const selectedCordinates = this.getSelectedAsciiStrings(
            feedData,
            { page: +startObj.page, line: startObj.line },
            { page: +endObj.page, line: endObj.line }
        );

        if (selectedCordinates.length) {

            if (endCount > startCount) {
                selectedCordinates[0].text = startObj.text;
                selectedCordinates[selectedCordinates.length - 1].text = endObj.text;
            } else {
                selectedCordinates[0].text = endObj.text;
                selectedCordinates[selectedCordinates.length - 1].text = startObj.text;
            }
            console.log(selectedCordinates);

            const selectedText = selectedCordinates.map(x => x.text).join('\n');
            const annotation: Annotation = {
                temp: true,
                nIDid: null,
                id: this.generateUniqueId(),
                pageIndex: startObj.page,
                text: selectedText,
                color: '5c9dff', // Set your desired color here
                cordinates: selectedCordinates
            };


            this.clearSelection();
            const lastIsid = this.annotationService.getAnnotLastIssue();
            if (!lastIsid?.nIid) {
                // this.OnEvent.emit({ event: 'ANNOTATED', annotation: annotation, });
                this.onAnnotEvent(annotation, feedValue[0], startObj.page);
            } else {
                this.saveAnnotations(annotation);
            }

        }
        this.resetSelection();

    }

    private generateUniqueId(): string {
        return Math.random().toString(36).substr(2, 9);
    }

    getSelectedAsciiStrings(
        feedPages: FeedPage[],
        start: { page: number; line: number },
        end: { page: number; line: number }
    ): issueCordinates[] {
        const result: issueCordinates[] = [];
        const total_lines = 25;

        // const feedData = feedPages.flatMap(a => a.data);

        // const feedData = feedPages.flatMap(a => a.data);
        const feedData = feedPages.flatMap(d => {
            const arr = d.data || [];
            const padCount = 25 - arr.length;
            // create an array of blank objects only if needed
            const padding = padCount > 0
                ? Array.from({ length: padCount }, () => ({ time: '00:00:00:00', asciiValue: [], lines: [''], oPage: 0, oLine: 0, unicid: '0' })) // Adjust the properties as needed
                : [];
            return [...arr, ...padding];
        })


        const startIndex = (start.page - 1) * 25 + (Number(start.line) - 1);
        const endIndex = (end.page - 1) * total_lines + (Number(end.line) - 1);


        const mode = this.getMode();

        for (let i = startIndex; i <= endIndex; i++) {
            const entry: FeedEntry = feedData[i];
            if (!entry) continue;
            const page = (Math.floor(i / total_lines) + 1);
            let str;
            if (mode == 'T') {
                str = entry.lines.join(' ').trimEnd();
            } else {
                str = entry.asciiValue
                    .map(code => String.fromCharCode(code))
                    .join('')
                    .trimEnd();

            }

            const lineNo = (i % total_lines) + 1; // Calculate line number based on index

            result.push({
                text: str,
                x: 0, // Placeholder, adjust as needed
                y: 0, // Placeholder, adjust as needed
                width: 20, // Placeholder, adjust as needed
                height: 20, // Placeholder, adjust as needed
                t: entry.time,
                l: lineNo,
                p: page,
                oP: entry.oPage,
                oL: entry.oLine,
                identity: entry.unicid || '0'
            });
        }



        // for (const pageBlock of feedPages) {

        //     if (pageBlock.page <= start.page && pageBlock.page >= end.page) {
        //         const lines = pageBlock.data;
        //         for (const [index, dt] of lines.entries()) {

        //             if (pageBlock.page <= start.page && (index + 1) <= start.line && pageBlock.page >= end.page) {

        //             }


        //         }
        //     };

        // }
        /*for (const pageBlock of feedPages) {
            const pg = pageBlock.page;
            if (pg < start.page || pg > end.page) continue;

            for (const entry of pageBlock.data) {
                const ln = entry.oLine;

                // skip anything before the start on the first page
                if (pg === start.page && ln < start.line) continue;
                // skip anything after the end on the last page
                if (pg === end.page && ln > end.line) continue;

                // convert asciiValue[] → string
                const str = entry.asciiValue
                    .map(code => String.fromCharCode(code))
                    .join('')
                    .trimEnd();
                result.push({
                    text: str,
                    x: 0, // Placeholder, adjust as needed
                    y: 0, // Placeholder, adjust as needed
                    width: 20, // Placeholder, adjust as needed
                    height: 20, // Placeholder, adjust as needed
                    t: entry.time,
                    l: ln,
                    p: pg,
                    oP: entry.oPage,
                    oL: entry.oLine,
                    identity: entry.unicid
                });
            }
        }*/

        return result;
    }
    onMouseMoveSelection(e) {
        if (!this.isSelection) return;
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed) return;
        const str = sel.toString();
        if (this.firstLineObj.isFirstSelected) {
            if (document.documentElement.contains(this.firstLineObj.element)) {
                this.firstLineObj.text = str.split('\n')[0];
                // console.warn('Mouse move selection:', this.firstLineObj.text);
            }
        }
        if (this.firstLineObj.isFirstSelected) return;
        const findLineElem = (node) => {
            if (!node) return null;
            return node.nodeType === 3
                ? node.parentElement.closest('.line')
                : node.closest('.line');
        };
        this.firstLineObj.element = findLineElem(sel.anchorNode);
        if (this.firstLineObj.element) {
            this.firstLineObj.page = this.firstLineObj.element?.getAttribute("pno")
            this.firstLineObj.line = this.firstLineObj.element?.getAttribute("lno")
            this.firstLineObj.isFirstSelected = true;
        }
    }


    async saveAnnotations(annotation: Annotation) {

        const selectedIssues = this.annotationService.getAnnotsIssueIds();
        const lastIsid = this.annotationService.getAnnotLastIssue();

        const mode = this.getMode();
        const mdl: any = {
            cNote: '',
            cONote: annotation.text || '',
            cIidStr: selectedIssues,
            nSessionid: this.getCurrentSession().nSesid,
            nCaseid: this.getCurrentSession().nCaseid,
            nLID: lastIsid?.nIid,//this.selectedIssues[this.selectedIssues.length - 1]["nIid"] || 0,
            cPageno: annotation?.pageIndex?.toString() || '1',
            jCordinates: annotation.cordinates || [],
            nUserid: this.getUserId(),
            cTranscript: mode == 'T' ? 'Y' : 'N'
        }

        const res = await this.issueServer.insertIssueDetail(mdl);
        if (res.length) {
            const newAnnotation: Annotation = {
                nIDid: res[0]["nIDid"],
                color: res[0]["cColor"],
                pageIndex: annotation.pageIndex,
                text: annotation.text,
                cordinates: annotation.cordinates,
                nICount: selectedIssues.length
            };

            // this.dialogEvent.emit({ event: 'ADD-ANNOTATION', data: { pageIndex: Number(this.annotations.pageIndex), newAnnotation: newAnnotation } });

            this.fds.addAnnotationToQueue(Number(annotation.pageIndex), newAnnotation);
            this.fds.checkTempAnnotatation(null);
            // this.dialogEvent.emit({ event: 'CHECK-TEMP-ANNOT', data: {} });
            this.annotationService.clearTempAnnotation();
        } else {
            this.tost.openSnackBar('Error in Inserting Issue', 'E');
        }


    }

    protected getUserId(): string {
        return null; // Replace with actual implementation
    }
    protected getMode(): string {
        return 'D'; // Return default mode or implement actual logic
    }
    protected getCurrentSession(): any {
        return null
    }
    protected onAnnotEvent(annotation, page, pageIndex) {

    }

    protected gethighlightmode(): hylightMD {
        return 'I'; // Return default highlight mode or implement actual logic
    }


    clearSelection() {
        const sel = window.getSelection?.();
        if (sel) {
            // modern browsers
            sel.removeAllRanges();
        } else if ((document as any).selection) {
            // IE ≤ 11
            (document as any).selection.empty();
        }
    }
}