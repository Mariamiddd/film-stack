import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { TmdbService } from './tmdb.service';

describe('TmdbService', () => {
  let service: TmdbService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TmdbService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(TmdbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
