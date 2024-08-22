import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = this.authService.getTocken();
    const skipUrls = ['/login', '/register'];
    const skip = skipUrls.some((skipUrl) => req.url.includes(skipUrl));

    if (skip) {
      return next.handle(req);
    }

    if (token) {
      const reqClone = req.clone({
        setHeaders: {
          authorization: `bear ${token}`,
        },
      });
      return next.handle(reqClone);
    }

    return next.handle(req);
  }
}
