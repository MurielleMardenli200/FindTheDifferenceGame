import { TestBed } from '@angular/core/testing';

import { InterceptorService } from './interceptor.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('InterceptorService', () => {
    let service: InterceptorService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(InterceptorService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
