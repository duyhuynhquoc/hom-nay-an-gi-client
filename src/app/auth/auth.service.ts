import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { SupabaseService } from '../supabase.service';
import { User } from './user.model';
import { JwtHelperService } from '@auth0/angular-jwt';

const helper = new JwtHelperService();

@Injectable({ providedIn: 'root' })
export class AuthService {
  private user = new User('', '', '', '', new Date());
  userChanged = new Subject<User>();

  constructor(private supabaseService: SupabaseService) {}

  getUserName() {
    return this.user.userName;
  }

  getUserId() {
    return this.user.userId;
  }

  authenticate() {
    let accessToken = localStorage.getItem('accessToken');

    if (accessToken) {
      const decodedToken = helper.decodeToken(accessToken);
      console.log(decodedToken);

      this.user = new User(
        decodedToken.sub,
        decodedToken.user_metadata['userName'],
        decodedToken.email,
        accessToken,
        new Date(decodedToken.exp)
      );
      this.userChanged.next(this.user);
    }
  }

  async signUp(email: string, password: string, userName: string) {
    return this.supabaseService.signUp(email, password, {
      userName,
    });
  }

  async signIn(email: string, password: string) {
    let { user, error } = await this.supabaseService.signIn(email, password);

    let accessToken =
      this.supabaseService.supabase.auth.session()?.access_token;

    if (accessToken) localStorage.setItem('accessToken', accessToken);

    // if (user) {
    //   this.user = new User(
    //     user.id,
    //     user.user_metadata['userName'],
    //     email,
    //     '',
    //     new Date()
    //   );
    //   this.userChanged.next(this.user);
    // }

    this.authenticate();
    return user;
  }

  async signOut() {
    await this.supabaseService.signOut();

    this.user = new User('', '', '', '', new Date());
    this.userChanged.next(this.user);

    localStorage.removeItem('accessToken');
  }
}
