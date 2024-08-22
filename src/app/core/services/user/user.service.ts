import { inject, Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  readonly prtefixUrl = '/users';

  private readonly api = inject(ApiService);
  getUsers() {
    return this.api.get(`${this.prtefixUrl}`);
  }

  getUserInfo() {
    return this.api.get(`${this.prtefixUrl}/me`);
  }
}
