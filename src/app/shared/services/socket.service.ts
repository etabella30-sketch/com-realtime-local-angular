import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';


import { io } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { SessionService } from './session.service';
import { SecureStorageService } from '../../core/services/storage/secure-storage.service';
import { UrlService } from '../../services/url.service';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  socket: any;
  socketRealtime: any;


  private messageSubject = new Subject<any>();
  private previousData = new Subject<any>();
  private lineReplaceData = new Subject<any>();
  private lineRefreshData = new Subject<any>();
  private feedRefreshData = new Subject<any>();
  private lineDeleteData = new Subject<any>();
  private lineAddonData = new Subject<any>();
  private sessionChange = new Subject<any>();
  private logdataChange = new Subject<any>();
  private updateData = new Subject<any>();
  private livedataSubject = new Subject<any>();

  private msgSubject_r = new Subject<any>();
  private uploadSubject = new Subject<any>();
  private annotRefreshTransfer = new Subject<any>();
  nUserid: string;
  tcpConnectionStatus: boolean = false;
  isConnected: boolean = false;
  constructor(private store: SecureStorageService, private url: UrlService) {
    this.nUserid = this.getLocalStorage('nUserid');
  }


  connect() {
    // this.socket = io('http://etabella.legal', {
    //   path: '/realtime',
    //   transports: ['polling'],  // Use only polling for testing
    //   withCredentials: true
    // }); //io('http://etabella.legal');// http://103.253.145.78:2086// http://192.168.1.16:5005//http://192.168.1.8:3001 http://localhost:3002

    // this.socket = io('http://103.253.145.78:2086'); //io('http://etabella.legal');// http://103.253.145.78:2086// http://192.168.1.16:5005//http://192.168.1.8:3001 http://localhost:3002
    // this.socket = io('https://etabella.legal', { path: '/socket.io/' });

    if (!this.isConnected) {
      this.isConnected = true;
      // console.warn('CONNECTION PROGRESS');
      this.socket = io(`${environment.localserver}`,
        {
          transports: ['websocket'], // remove 'polling'
          reconnection: true,            // Enable auto-reconnection
          reconnectionAttempts: Infinity, // Set the number of reconnection attempts to infinity
          reconnectionDelay: 1000,        // Set the initial delay for reconnection to 1000ms
          reconnectionDelayMax: 5000,     // Set the maximum delay between reconnections to 5000ms
          randomizationFactor: 0.5,        // Set the randomization factor for reconnection delay to 0.5
        }
      );


    };

    /* this.socketRealtime = io(`${this.url.realtimeserver}`, {
       path: '',
       reconnection: true,            // Enable auto-reconnection
       reconnectionAttempts: Infinity, // Set the number of reconnection attempts to infinity
       reconnectionDelay: 1000,        // Set the initial delay for reconnection to 1000ms
       reconnectionDelayMax: 5000,     // Set the maximum delay between reconnections to 5000ms
       randomizationFactor: 0.5,        // Set the randomization factor for reconnection delay to 0.5
       query: {
         nUserid: this.nUserid,
       }
     });*/


    this.socket.on('connect', () => {
      // this.tcpConnectionStatus = true;
      // console.warn('Connected to the server');

      this.isConnected = true;


      this.sendMessage('refresh-status-tcp', { msg: 1 });
    });

    this.socket.on('disconnect', (reason) => {
      // this.tcpConnectionStatus = false;
      console.warn(`Disconnected: `, reason);
      this.isConnected = false;
    });



    this.socket.on('tcp-connection-status', (msg: any) => {
      // console.warn('tcp-connection-status', msg);
      this.tcpConnectionStatus = msg.status || false;
    });

    this.socket.on('transfer-service-status', (msg: any) => {
      // console.warn('tcp-connection-status', msg);
      this.url.transferServiceStatus = msg.status || 'offline';
    });

    this.socket.on('message', (msg: any) => {
      //  alert("22")
      this.msgSubject_r.next(msg);
      this.messageSubject.next(msg);
    });

    this.socket.on('previous-data', (res: any) => {
      this.previousData.next(res);
    });

    this.socket.on('line-replace', (res: any) => {
      // console.warn('line-replace', res);
      this.lineReplaceData.next(res);
    });
    this.socket.on('refresh-data', (res: any) => {
      // console.warn('refresh-data', res);
      this.lineRefreshData.next(res);
    });
    this.socket.on('line-delete', (res: any) => {
      // console.warn('line-delete', res);
      this.lineDeleteData.next(res);
    });
    this.socket.on('line-addon', (res: any) => {
      // console.warn('line-addon', res);
      this.lineAddonData.next(res);
    });
    this.socket.on('session-change', (res: any) => {
      this.sessionChange.next(res);
    });
    this.socket.on('update', (msg: any) => {
      this.updateData.next(msg);
    });

    this.socket.on('feed-refresh-data', (res: any) => {
      this.feedRefreshData.next(res);
    });

    this.socket.on('log-data', (res: any) => {
      this.logdataChange.next(res);
    });


    this.socket.on('live-servers', (msg: any) => {
      this.livedataSubject.next(msg);
    });

    this.socket.on('connect_error', (error) => {
      console.error(`Connection Error: `, error);
      this.isConnected = false;
    });


    this.socket.on('annot-refresh-transfer', (res: any) => {
      this.annotRefreshTransfer.next(res);
    });

    if (false) {
      this.socketRealtime.on('connect', () => {
        console.log('Connected to the server');
      });


      this.socketRealtime.on('disconnect', (reason) => {
        console.log(`Disconnected: ${reason}`);
        if (reason === 'io server disconnect') {
          // The server can initiate a disconnection, you may need to reconnect manually.
          this.socketRealtime.connect();
        }
      });

      this.socketRealtime.on('connect_error', (error) => {
        console.error(`Connection Error: ${error}`);
      });

      this.socketRealtime.on('message', (msg: any) => {
        alert('msg receive on +shared')
        this.msgSubject_r.next(msg);
      });



      this.socketRealtime.on('upload-messages', (msg: any) => {
        this.uploadSubject.next(msg);
      });
    }




  }


  getLocalStorage(key) {
    let val = localStorage.getItem(key);
    return val;
  }


  public sendMessage(event: any, message: any): void {
    this.socket.emit(event, message);
  }


  public sendMessageR(event: any, message: any): void {
    this.socketRealtime.emit(event, message);
  }

  public getMessages(): Observable<any> {
    return this.messageSubject.asObservable();
  }

  public getPrevious(): Observable<any> {
    return this.previousData.asObservable();
  }

  public getLineRepalce(): Observable<any> {
    return this.lineReplaceData.asObservable();
  }

  public getRefreshRepalce(): Observable<any> {
    return this.lineRefreshData.asObservable();
  }
  public getLineDelete(): Observable<any> {
    return this.lineDeleteData.asObservable();
  }
  public getLineAddon(): Observable<any> {
    return this.lineAddonData.asObservable();
  }
  public getFeedRefreshData(): Observable<any> {
    return this.feedRefreshData.asObservable();
  }
  public getSessionChange(): Observable<any> {
    return this.sessionChange.asObservable();
  }

  public getLogdata(): Observable<any> {
    return this.logdataChange.asObservable();
  }


  public getUpdate(): Observable<any> {
    return this.updateData.asObservable();
  }

  public getLiveServers(): Observable<any> {
    return this.livedataSubject.asObservable();
  }

  // public disconnect(): void {
  //   if (this.socket) {
  //     this.socket.disconnect();
  //   }
  // }


  public getAnnotsRefreshTransfer(): Observable<any> {
    return this.annotRefreshTransfer.asObservable();
  }
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      console.log('Socket disconnected');
    }
    if (this.socketRealtime) {
      this.socketRealtime.disconnect();
      console.log('Real-time socket disconnected');
    }
  }


  public getMessagesR(): Observable<any> {
    return this.msgSubject_r.asObservable();
  }

  public getUploades(): Observable<any> {
    return this.uploadSubject.asObservable();
  }


  async joinRealtime(id: string) {

    // if (this.isJoined) {
    //   return;
    // }
    const nUserid = await this.store.getUserId();
    // this.isJoined = true;
    this.socket.emit('join-room', { room: `S${id}`, nSesid: id, userid: id, nUserid: nUserid, isCreator: false });
  }


  async leaveRealtime(id: string) {
    // if (this.isJoined) {
    //   return;
    // }
    const nUserid = await this.store.getUserId();
    // this.isJoined = true;
    this.socket.emit('leave-room', { room: `S${id}`, userid: id, nUserid: nUserid, isCreator: false });
  }
}
