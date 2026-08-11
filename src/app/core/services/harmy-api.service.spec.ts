import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HarmyApiService, Post, Order } from './harmy-api.service';

describe('HarmyApiService', () => {
  let service: HarmyApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        HarmyApiService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(HarmyApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('devrait être créé', () => {
    expect(service).toBeTruthy();
  });

  it('devrait récupérer la liste des posts du catalogue (getPosts)', async () => {
    const mockPosts: Partial<Post>[] = [
      { id: '1', caption: 'Robe Wax', priceHint: 45000 }
    ];

    const promise = service.getPosts();

    const req = httpMock.expectOne('http://localhost:8080/api/v1/posts');
    expect(req.request.method).toBe('GET');
    req.flush(mockPosts);

    const posts = await promise;
    expect(posts.length).toBe(1);
    expect(posts[0].caption).toBe('Robe Wax');
  });

  it('devrait créer une nouvelle commande avec la structure unifiée (createOrder)', async () => {
    const newOrderData = {
      customerRefId: 'cust-123',
      total: 80000,
      deposit: 30000
    };

    const mockResponse: Partial<Order> = {
      id: 'cmd-999',
      prixTotal: 80000,
      acompteVerse: 30000,
      soldeRestant: 50000,
      statut: 'TISSU_RECU'
    };

    const promise = service.createOrder(newOrderData);

    const req = httpMock.expectOne('http://localhost:8080/api/v1/orders');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newOrderData);
    req.flush(mockResponse);

    const res = await promise;
    expect(res.id).toBe('cmd-999');
    expect(res.soldeRestant).toBe(50000);
  });
});
