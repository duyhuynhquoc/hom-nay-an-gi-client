import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { SupabaseService } from 'src/app/supabase.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup = new FormGroup({
    userName: new FormControl(''),
    email: new FormControl(''),
    password: new FormControl(''),
  });

  constructor(private supabaseService: SupabaseService) {}

  ngOnInit(): void {}

  async onSubmit() {
    const { email, password, userName } = this.signupForm.value;
    const { user, error } = await this.supabaseService.signUp(email, password);
  }
}
