export type RefreshToken = string;
export type AccessToken = string;

export interface Tokens {
    accessToken: AccessToken;
    refreshToken: RefreshToken;
}

export interface JwtPayload {
    sub: string;
    createdAt: Date;
    expiresAt: Date;
    username: string;
}

export interface RawPayload {
    sub: string;
    createdAt: number;
    expiresAt: number;
    username: string;
}
