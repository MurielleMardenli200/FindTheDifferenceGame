import { Injectable } from '@angular/core';
import { AccessToken, JwtPayload, RawPayload, RefreshToken, Tokens } from '@common/tokens';
import { TokenExpiredError } from './token-expired-error';
import { EPOCH_TO_SECONDS, REFRESH_TOKEN_KEY } from './token.constants';
@Injectable({
    providedIn: 'root',
})
export class TokenService {
    private accessToken: string | null = null;
    private accessTokenPayload: JwtPayload | null = null;
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers

    getTokens(): Tokens {
        const refreshToken: RefreshToken | null = localStorage.getItem(REFRESH_TOKEN_KEY);
        if (refreshToken === null) {
            throw new TokenExpiredError('No refresh token found');
        }
        const accessToken: AccessToken = this.getAccessToken();
        return { accessToken, refreshToken };
    }

    getRefreshToken(): RefreshToken {
        const refreshToken: RefreshToken | null = localStorage.getItem(REFRESH_TOKEN_KEY);
        if (refreshToken === null) {
            throw new TokenExpiredError('No refresh token found');
        }
        return refreshToken;
    }

    setRefreshToken(token: RefreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, token);
    }

    setAccessToken(token: AccessToken): void {
        this.accessToken = token;
    }

    removeTokens(): void {
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        this.accessTokenPayload = null;
        this.accessToken = null;
    }

    private getAccessToken(): AccessToken {
        if (this.isAccessTokenExpired() || this.accessToken === null) {
            throw new TokenExpiredError('Access token expired');
        }

        return this.accessToken;
    }

    private isAccessTokenExpired(): boolean {
        if (this.accessToken === null) {
            return true;
        }

        return new Date() > this.getAccessTokenPayload().expiresAt;
    }

    private getAccessTokenPayload(): JwtPayload {
        if (this.accessTokenPayload === null) {
            this.accessTokenPayload = this.decodeToken();
        }

        return this.accessTokenPayload;
    }

    private decodeToken(): JwtPayload {
        if (this.accessToken === null) {
            throw new Error('No access token found');
        }

        const base64Payload = this.accessToken.split('.')[1];
        const rawPayload: RawPayload = JSON.parse(atob(base64Payload));

        return {
            sub: rawPayload.sub,
            createdAt: new Date(rawPayload.createdAt * EPOCH_TO_SECONDS),
            expiresAt: new Date(rawPayload.expiresAt * EPOCH_TO_SECONDS),
            username: rawPayload.username,
        };
    }
}
