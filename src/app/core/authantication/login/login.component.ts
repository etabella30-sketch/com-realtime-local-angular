import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
// import { LoginService } from '../../services/login/login.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { SecureStorageService } from '../../services/storage/secure-storage.service';
import { InputComponent } from '../../../shared/components/input/input.component';
import { LoginService } from '../../services/login/login.service';
import { TostbarService } from '../../services/tost/tostbar.service';
import { SocketService } from '../../../shared/services/socket.service';
@Component({
  selector: 'app-login',
  standalone: true,
  providers: [LoginService],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, InputComponent, MatCheckboxModule, ButtonComponent, AvatarComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  showprogress: boolean = true;
  keepMeLogin: boolean = false;
  isloading: boolean = false;
  currentprogress: number = 0;
  userdetail: any;
  getYear: any = new Date().getFullYear();
  constructor(
    public logS: LoginService,
    private router: Router, private formBuilder: FormBuilder, private socket: SocketService, private ss: SecureStorageService, private tost: TostbarService) {

  }
  ngOnInit() {
    this.socket.disconnect();
    this.loginForm = this.formBuilder.group({
      cEmail: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]] //, Validators.minLength(6), Validators.pattern('^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{6,}$')
    });
  }


  async onSubmit() {
    debugger;
    if (this.loginForm.valid) {
      this.isloading = true;
      let res: any = await this.logS.login(this.loginForm.value, this.keepMeLogin);
      this.isloading = false;
      if (res) {
        this.userdetail = await this.ss.getUserInfo();
        let id: string = await this.ss.getUserId();
        if (id) {
          this.socket.connect();
        }
        this.loadprogress();

      } else {
        this.tost.openSnackBar('User Not Found', 'E');
      }
    }
  }

  loadprogress() {
    const intervalId = setInterval(() => {
      this.currentprogress++;
      if (this.currentprogress > 99) {
        clearInterval(intervalId);
        this.router.navigate(['/realtime/dashboard']);
      }
    }, 15);
  }

}
