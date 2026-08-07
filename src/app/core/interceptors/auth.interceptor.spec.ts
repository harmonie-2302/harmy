import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '@core/services/auth.service';

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let authService: AuthService;

  const mockToken = 'test_jwt_token_12345';

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting()
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
  });

  afterEach(() => {
    httpTestingController.verify();
    localStorage.clear();
  });

  it('should attach Bearer Authorization header when token exists', () => {
    authService.login(mockToken);

    httpClient.get('/api/v1/orders').subscribe();

    const req = httpTestingController.expectOne('/api/v1/orders');
    expect(req.request.headers.has('Authorization')).toBeTrue();
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
  });

  it('should NOT attach Authorization header for auth endpoint requests', () => {
    authService.login(mockToken);

    httpClient.post('/api/auth/login', {}).subscribe();

    const req = httpTestingController.expectOne('/api/auth/login');
    expect(req.request.headers.has('Authorization')).toBeFalse();
  });
});
