import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './core/components/header/header.component';
import { SessionService } from './shared/services/session.service';
import { HttpClientModule } from '@angular/common/http';
import { SocketService } from './shared/services/socket.service';
import { RealtimeService } from './realtime/services/realtime/realtime.service';
import { environment } from '../environments/environment';
import { UrlService } from './services/url.service';
import { SecureStorageService } from './core/services/storage/secure-storage.service';
import { CommonfunctionService } from './core/utility/commonfunction.service';

@Component({
  selector: 'app-root',
  standalone: true,
  providers: [],
  imports: [RouterOutlet, HeaderComponent, CommonModule, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'realtime';
  name = environment.name;
  cSession = window.localStorage.getItem('logSession')
  constructor(private readonly sessionService: SessionService, private readonly socketService: SocketService, public realtimeService: RealtimeService, public url: UrlService

    , public cf: CommonfunctionService, private ss: SecureStorageService) {
    realtimeService.getTimeZone()
    let id: any = window.localStorage.getItem('nUserid') ? window.localStorage.getItem('nUserid') : '';
    if (id) {

      this.initProcess()
    }

    // socketService.connect();
  }


  async initProcess() {


    // this.veriFySesion()

    this.socketService.connect();
    await this.url.getUrl()
  }

  /* async veriFySesion() {
     const res = await this.sessionService.getLogSession()
     if (res.msg == 1) {
       if (this.cSession != res.cSession) {
         // this.logout  
         window.localStorage.setItem('logSession', res.cSession);
         this.ss.logOut();
         this.cf.goto('/auth/login');
 
       }
     } else {
       // this.logout
       this.ss.logOut();
       this.cf.goto('/auth/login');
     }
   }*/

  ispage(flag) {
    if (window.location.href.includes(flag)) {
      return true;
    }
    return false;
  }

}
