import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { SupabaseService } from '../supabase.service';
import { User } from './user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private user = new User('', '', '');
  userChanged = new Subject<User>();

  constructor(private supabaseService: SupabaseService) {}

  async signUp(email: string, password: string, userName: string) {
    return this.supabaseService.signUp(email, password, {
      userName,
    });
  }

  async signIn(email: string, password: string) {
    let { user, error } = await this.supabaseService.signIn(email, password);
    if (user) {
      this.user = new User(user.id, user.user_metadata['userName'], email);
      this.userChanged.next(this.user);
    }

    return user;
  }

  getUserName() {
    return this.user.userName;
  }

  getUserId() {
    return this.user.userId;
  }

  signOut() {
    this.supabaseService.signOut();
    this.user = new User('', '', '');
    this.userChanged.next(this.user);
  }
}
