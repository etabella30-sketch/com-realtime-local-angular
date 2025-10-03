import { Injectable } from '@angular/core';
import { SecureStorageService } from '../storage/secure-storage.service';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {
  Casedetail;
  userdetail;
  // isCaseedit: boolean = false;
  isCaseedit: any = new BehaviorSubject<boolean>(false);
  expandhyper: boolean = false;
  casedetal: any = {};
  caseName: string = '';
  // currentadminpath: string = '';
  currentadminpath: any = new BehaviorSubject<string>('');

  constructor(public ss: SecureStorageService,
    //private http: HttpClient, public tost: TostbarService
    private router: Router
  ) { }

  async ngOnInit() {
    this.userdetail = await this.ss.getUserInfo();
  }

  updatePath(newPath: string) {
    this.currentadminpath.next(newPath);
  }


  updateisCase(val: boolean) {
    this.isCaseedit.next(val);
  }

  // async caseDetete(mdl: caseDelReq): Promise<boolean> {
  //   try {
  //     const res: any = await firstValueFrom(
  //       this.http.post<caseDelRes>(`${environment.cloudUrl}${environment.coreservice}/case/casedelete`, mdl)
  //     );
  //     if (res && res.msg == 1) {
  //       this.tost.openSnackBar(res.value, '');
  //       return true;
  //     } else {
  //       this.tost.openSnackBar(res.value, '');
  //       return false;
  //     }
  //   } catch (err) {
  //     this.tost.openSnackBar(`Case deletion failed ${err}`, '');
  //     return false;
  //   }
  // }
  goUserHome() {
    this.router.navigate(['user/dashboard'], { replaceUrl: true });
  }

  goAdminHome() {
    this.router.navigate(['/admin/dashboard'], { replaceUrl: true });
  }

}
