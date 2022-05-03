import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnInit {
  error = '';

  signupForm: FormGroup = new FormGroup({
    userName: new FormControl(''),
    email: new FormControl(''),
    password: new FormControl(''),
  });

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private appService: AppService
  ) {}

  ngOnInit(): void {}

  async onSubmit() {
    this.appService.loadingOn();
    let { email, password, userName } = this.signupForm.value;
    if (userName == '') userName = 'Thực khách vô danh';
    const { user, error } = await this.authService.signUp(
      email,
      password,
      userName
    );
    this.appService.loadingOff();
    if (user) {
      this.router.navigate(['signin']);
    } else {
      if (error) {
        switch (error.message) {
          case 'Signup requires a valid password':
            this.error = 'Mật khẩu khum hợp lệ';
            break;
          case 'To signup, please provide your email':
            this.error = 'Email khum hợp lệ';
            break;
          default:
            this.error = error.message;
        }
      }
    }
  }
}
