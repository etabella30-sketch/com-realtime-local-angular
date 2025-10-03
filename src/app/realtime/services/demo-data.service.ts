import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Subscription } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DemoDataService {
    private demoData = new BehaviorSubject<any>(null);
    private intervalSubscription: Subscription;
    private globalLineIndex = 0;

    constructor(private http: HttpClient) { }

    get demoData$() {
        return this.demoData.asObservable();
    }

    stopDemoStream() {
        if (this.intervalSubscription) {
            this.intervalSubscription.unsubscribe();
            this.intervalSubscription = null;
            this.demoData.next(null);
        }
        this.globalLineIndex = 0; // Reset the global line index when stopping the stream
    }

    async streamDemoData(data: any) {
        try {
            this.stopDemoStream();
        } catch (error) {
            console.error('Error stopping demo stream:', error);
        }

        const FilePath = 'assets/demo-stream.json';
        console.log('File path:', FilePath);

        try {
            const recData = await this.fetchFile(FilePath);
            if (recData) {
                const allData = JSON.parse(recData);
                if (!allData.length) return;

                for (let index = 0; index < allData.length; index++) {
                    await this.processPage(allData, index, data.nSesid);
                }
            }
        } catch (error) {
            console.log('Error fetching from file', error);
        }
    }

    private fetchFile(filePath: string): Promise<string> {
        return this.http.get(filePath, { responseType: 'text' }).toPromise();
    }

    private async processPage(allData: any, pageIndex: number, nSesid: string) {
        const page = allData[pageIndex];
        if (page && page.data && page.data.length) {
            for (let x of page.data) {
                const lineAchii = this.stringToAscii(x.lines[0]);
                if (lineAchii.length) {
                    for (let i = 0; i < lineAchii.length; i++) {
                        const startTime = Date.now();
                        const newText = lineAchii.slice(0, i + 1);
                        const SendArray = [x.time, newText, this.globalLineIndex];
                        const datas = {
                            i: this.globalLineIndex,
                            d: [SendArray],
                            date: nSesid,
                            l: 25,
                            p: page.page
                        };
                        //  console.log('Demo data:', page.page, this.globalLineIndex);
                        this.demoData.next(datas);
                        await this.delay(10); // Delay of 75 milliseconds
                        const endTime = Date.now();
                        //   console.log(`Time duration: ${endTime - startTime} ms`);
                    }
                    this.globalLineIndex++; // Increment the global line index after processing the line
                }
            }
        }
    }

    private stringToAscii(str: string): number[] {
        return str.split('').map(char => char.charCodeAt(0));
    }

    private delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
