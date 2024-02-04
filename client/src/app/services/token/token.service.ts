import { Injectable } from '@angular/core';
import { AccessToken, JwtPayload, RawPayload, RefreshToken, Tokens } from '@common/tokens';
import { TokenExpiredError } from './token-expired-error';

@Injectable({
    providedIn: 'root',
})
export class TokenService {
    private readonly refreshTokenKey = 'refresh-token';
    private accessToken: string | null = null;
    private accessTokenPayload: JwtPayload | null = null;
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    private timeMultiplier = 1000;

    getTokens(): Tokens {
        const refreshToken: RefreshToken | null = localStorage.getItem(this.refreshTokenKey);
        if (refreshToken === null) {
            throw new TokenExpiredError('No refresh token found');
        }
        const accessToken: AccessToken = this.getAccessToken();
        return { accessToken, refreshToken };
    }

    getRefreshToken(): RefreshToken {
        const refreshToken: RefreshToken | null = localStorage.getItem(this.refreshTokenKey);
        if (refreshToken === null) {
            throw new TokenExpiredError('No refresh token found');
        }
        return refreshToken;
    }

    setRefreshToken(token: RefreshToken) {
        localStorage.setItem(this.refreshTokenKey, token);
    }

    setAccessToken(token: AccessToken): void {
        this.accessToken = token;
    }

    removeTokens(): void {
        localStorage.removeItem(this.refreshTokenKey);
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
            createdAt: new Date(rawPayload.createdAt * this.timeMultiplier),
            expiresAt: new Date(rawPayload.expiresAt * this.timeMultiplier),
            username: rawPayload.username,
        };
    }
}
