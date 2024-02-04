/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { TestBed } from '@angular/core/testing';
import { TokenService } from './token.service';

describe('TimeLimitedModeService', () => {
    let service: TokenService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [TokenService],
        });

        spyOn(window, 'setInterval');
        service = TestBed.inject(TokenService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
