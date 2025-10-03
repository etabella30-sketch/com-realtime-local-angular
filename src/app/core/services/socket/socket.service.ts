import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import { io } from 'socket.io-client';
import { environment } from '../../../../environments/environment';
import { SecureStorageService } from '../storage/secure-storage.service';
import { CommonfunctionService } from '../../utility/commonfunction.service';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  socket: any;
  realTimeSocket: any;
  private messageSubject = new Subject<any>();

  private previousData = new Subject<any>();
  private realtimeSubject = new Subject<any>();
  private uploadSubject = new Subject<any>();
  private indexSubject = new Subject<any>();
  private paginationSubject = new Subject<any>();
  private exportSubject = new Subject<any>();
  private RmessageSubject = new Subject<any>();
  private RDemomessageSubject = new Subject<any>();
  isJoined: boolean = false
  private batchfileSubject = new Subject<any>();
  constructor(private store: SecureStorageService, public cf: CommonfunctionService) { }


  async connect(id: number) {
    console.warn('CONNECTION PROGRESS 2',id);
    const token = await this.store.getJWTToken();    
    debugger;
    // return;
    this.socket = io(`${environment.cloudUrl2}${environment.socketservice}`, {
      path: '/socketservice/socket.io',
      reconnection: true,            // Enable auto-reconnection
      reconnectionAttempts: Infinity, // Set the number of reconnection attempts to infinity
      reconnectionDelay: 500,        // Set the initial delay for reconnection to 1000ms
      reconnectionDelayMax: 5000,     // Set the maximum delay between reconnections to 5000ms
      randomizationFactor: 0.5,        // Set the randomization factor for reconnection delay to 0.5
      query: {
        nUserid: id
      },
      transportOptions: {
        polling: {
          extraHeaders: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    });

    this.socket.on('connect', () => {
      console.warn('Connected to the server 2');
      // setTimeout(() => {
      this.socket.emit('join-room', { room: `U${id}`, userid: id, isCreator: false });
      // }, 500);
    });

    this.socket.on('disconnect', (reason) => {
      console.log(`Disconnected: ${reason}`);
      if (reason === 'io server disconnect') {
        // The server can initiate a disconnection, you may need to reconnect manually.
        this.socket.connect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error(`Connection Error: ${error}`);
    });

    this.socket.on('message', (msg: any) => {
      alert('msg receive on +core')
      this.messageSubject.next(msg);
    });


    this.socket.on('upload-messages', (msg: any) => {
      this.uploadSubject.next(msg);
    });

    this.socket.on('server-connected-status', (msg: any) => {
      this.uploadSubject.next(msg);
    });

    this.socket.on('index-messages', (msg: any) => {
      this.indexSubject.next(msg);
    });

    this.socket.on('pagination-messages', (msg: any) => {
      this.paginationSubject.next(msg);
    });

    this.socket.on('batchfile-messages', (msg: any) => {
      this.batchfileSubject.next(msg);
    });

    this.socket.on('EXPORT-EXCEL-RESPONCE', (msg: any) => {
      this.exportSubject.next(msg);
    });


    this.socket.on('LOGIN-VERIFY', (msg: any) => {
      // console.log('TOPIC-LOGIN-VERIFY')
      // const glStorage = this.store.getStorage('browserid');
      // console.log('LOGIN-VERIFY', msg, glStorage)
      // if (msg && msg.data && msg.data.cBroweserid != glStorage) {
      //   this.store.logOut();
      //   this.cf.goto('/auth/login');
      // }
    });

    // if(environment.production){
    //   this.realTimeSocket = io('https://etabella.legal', { path: '/socket.io/' }); //http://localhost:5005 //https://etabella.legal
    // }else{
    //   this.realTimeSocket = io(`${environment.cloudUrl}${environment.realtimeserive}`);
    // }


    // this.realTimeSocket = io('https://etabella.legal', { path: '/socket.io/' }); //http://localhost:5005

    //this.realTimeSocket = io(`http://192.168.1.21:5005`);
    this.realTimeSocket = io(`http://103.253.145.78:2086`);
    if (environment.production) {
      // this.realTimeSocket = io('https://etabella.legal', { path: '/socket.io/' }); //http://localhost:5005
    } else {
      // this.realTimeSocket = io(`${environment.cloudUrl}${environment.realtimeserive}`);
    }


    this.realTimeSocket.on('connect', () => {
      // this.tcpConnectionStatus = true;
      console.log('realtime Connected to the server');
    });
    this.realTimeSocket.on('disconnect', () => {
      // this.tcpConnectionStatus = false;
      console.log('realtime Disconnected from the server');
    });

    this.realTimeSocket.on('on-notification', (msg: any) => {
      this.realtimeSubject.next(msg);
    });

    this.realTimeSocket.on('previous-data', (res: any) => {

      this.previousData.next(res);
    });

    this.realTimeSocket.on('message', (msg: any) => {

      this.RmessageSubject.next(msg);
    });
    this.realTimeSocket.on('demo-message', (msg: any) => {
      this.RDemomessageSubject.next(msg);
    });

  }



  public sendMessage(event: any, message: any): void {
    this.socket.emit(event, message);
  }

  public getMessages(): Observable<any> {
    return this.messageSubject.asObservable();
  }



  public getUploades(): Observable<any> {
    return this.uploadSubject.asObservable();
  }



  public getIndexs(): Observable<any> {
    return this.indexSubject.asObservable();
  }


  public getPagination(): Observable<any> {
    return this.paginationSubject.asObservable();
  }

  public getBatchfile(): Observable<any> {
    return this.batchfileSubject.asObservable();
  }


  public getExports(): Observable<any> {
    return this.exportSubject.asObservable();
  }


  public getNotification(): Observable<any> {
    return this.realtimeSubject.asObservable();
  }


  //////////////////////////////

  public getPrevious(): Observable<any> {
    return this.previousData.asObservable();
  }

  public getMessagesR(): Observable<any> {
    return this.RmessageSubject.asObservable();
  }
  public getDemoMessagesR(): Observable<any> {
    return this.RDemomessageSubject.asObservable();
  }

  public sendMessageR(event: any, message: any): void {
    this.realTimeSocket.emit(event, message);
  }


  async joinRealtime(id: number) {

    // if (this.isJoined) {
    //   return;
    // }
    const nUserid = await this.store.getUserId();
    if(!nUserid)return;
    this.isJoined = true;
    this.realTimeSocket.emit('join-room', { room: `S${id}`,nSesid:id, userid: id, nUserid: nUserid, isCreator: false });
  }


  async leaveRealtime(id: number) {
    // if (this.isJoined) {
    //   return;
    // }
    const nUserid = await this.store.getUserId();
    if(!nUserid)return;
    this.isJoined = true;
    this.realTimeSocket.emit('leave-room', { room: `S${id}`, userid: id, nUserid: nUserid, isCreator: false });
  }

}
