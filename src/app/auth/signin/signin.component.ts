import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

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

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {}

  async onSubmit() {
    const { email, password } = this.signinForm.value;

    const { user, error } = await this.authService.signIn(email, password);

    console.log(error);

    if (user) {
      this.router.navigate(['']);
    } else {
      if (error) {
        switch (error.message) {
          case 'Email not confirmed':
            this.error =
              'Your email has not been confirm. Please check your email.';
            break;
          case 'Invalid login credentials':
            this.error = 'Wrong email or password';
            break;
          default:
            this.error = error.message;
        }
      }

      // if (error?.message == 'Email not confirmed') {
      //   this.error = 'Your email has not been confirm. Please check your email.';
      // } else if ()this.error = error?.message || '';
    }
  }
}
