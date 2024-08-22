import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth/auth.service';

describe('authGuard', () => {
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        {
          provide: AuthService,
          useValue: {
            isLoggedIn: jasmine.createSpy('isLoggedIn').and.returnValue(true),
            logout: jasmine.createSpy('logout'),
          },
        },
      ],
    });

    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  it('should allow the authenticated user to access the route', () => {
    TestBed.runInInjectionContext(() => {
      (authService.isLoggedIn as jasmine.Spy).and.returnValue(true);
      const result = authGuard({} as any, {} as any);
      expect(result).toBeTrue();
    });
  });

  it('should not allow the unauthenticated user to access the route and call logout', () => {
    TestBed.runInInjectionContext(() => {
      (authService.isLoggedIn as jasmine.Spy).and.returnValue(false);
      const result = authGuard({} as any, {} as any);
      expect(result).toBeFalse();
      expect(authService.logout).toHaveBeenCalled();
    });
  });
});
