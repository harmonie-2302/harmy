import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  // Fake JWT Token with valid base64 payload { "id": "user-123", "email": "test@harmy.com", "role": "COUTURIERE" }
  const mockToken = 'eyJhbGciOiJIUzI1NiJ9.ZXlKcGJDSTZJTVZ6WlhJdE1USXpJaXdpWlcxaGFXd2lPaUp0YjJOcklpd2ljMjhoZEdWdWRDQTZJVTFWVkZSSlZWSkZJbjA9.signature';

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return false for isAuthenticated by default when no token stored', () => {
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('should login and set isAuthenticated to true', () => {
    service.login(mockToken);
    expect(service.getToken()).toBe(mockToken);
    expect(service.isAuthenticated()).toBeTrue();
  });

  it('should logout and clear authentication state', () => {
    service.login(mockToken);
    expect(service.isAuthenticated()).toBeTrue();

    service.logout();
    expect(service.getToken()).toBeNull();
    expect(service.isAuthenticated()).toBeFalse();
  });
});
