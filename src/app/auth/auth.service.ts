import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { SupabaseService } from '../supabase.service';
import { User } from './user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  user: Subject<User> = new Subject<User>();

  constructor(private supabaseService: SupabaseService) {}

  async signIn(email: string, password: string) {
    let { user, error } = await this.supabaseService.signIn(email, password);
  }
}
