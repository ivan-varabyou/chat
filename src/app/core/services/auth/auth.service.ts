import { inject, Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { useStorage } from '../storage/use-storage.function';
import { AuthData } from './auth.models';
import { Router } from '@angular/router';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private api = inject(ApiService);
  private token = useStorage('token');
  private router = inject(Router);
  private store = null;

  login(data: AuthData) {
    return this.api
      .post<{ token: string }, AuthData>('/login', data)
      .pipe(tap((res) => this.token.set(res.token)));
  }

  logout() {
    this.token.set('');
    this.router.navigate(['/login']);
  }

  register(data: AuthData) {
    return this.api.post('/register', data);
  }

  getTocken() {
    return this.token();
  }

  isLoggedIn() {
    return !!this.token();
  }
}
