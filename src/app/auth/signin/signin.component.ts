import { Component, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { EventEmitter } from '@angular/core';
import { AuthService } from '../auth.service';
import { AppService } from 'src/app/app.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss'],
})
export class SigninComponent implements OnInit {
  signinForm: FormGroup = new FormGroup({
    email: new FormControl(''),
    password: new FormControl(''),
  });

  error = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private appService: AppService
  ) {}

  ngOnInit(): void {}

  async onSubmit() {
    this.appService.loadingOn();

    const { email, password } = this.signinForm.value;

    const { user, error } = await this.authService.signIn(email, password);

    this.appService.loadingOff();

    if (user) {
      this.router.navigate(['']);
    } else {
      if (error) {
        switch (error.message) {
          case 'Email not confirmed':
            this.error =
              'Bạn cần xác nhận email trước đã. Kiểm tra email và bấm vào đường link nhaa.';
            break;
          case 'Invalid login credentials':
            this.error = 'Sai mật khẩu rồi bé';
            break;
          default:
            this.error = error.message;
        }
      }
    }
  }
}
