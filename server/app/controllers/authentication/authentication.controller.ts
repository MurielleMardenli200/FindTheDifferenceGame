import { UserDto } from '@app/model/dto/user-dto';
import { AuthenticationService } from '@app/services/authentication/authentication.service';
import { JwtTokensDto } from '@common/model/dto/jwt-tokens.dto';
import { Body, Controller, HttpException, HttpStatus, Post, Req } from '@nestjs/common';
import { ApiBody, ApiForbiddenResponse, ApiHeader, ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { LoginDto } from '@common/model/dto/login.dto';
import { RefreshDto } from '@common/model/dto/refresh.dto';

@ApiTags('Authentification')
@ApiHeader({ name: 'username' })
@Controller('auth')
export class AuthenticationController {
    constructor(private authenticationService: AuthenticationService) {}

    @Post('/login')
    @ApiOperation({ summary: 'Log into app' })
    @ApiOkResponse({ status: HttpStatus.OK, description: 'Okay to log into app' })
    @ApiForbiddenResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized to sign in to app' })
    @ApiBody({
        type: UserDto,
        description: 'User credentials to log into app',
        examples: {
            a: {
                summary: 'Example credentials',
                value: {
                    username: 'gary',
                    password: 'test',
                } as UserDto,
            },
        },
    })
    async logIn(@Body() signInDto: LoginDto): Promise<JwtTokensDto> {
        return await this.authenticationService.logIn(signInDto.username, signInDto.password);
    }

    @Post('/signup')
    @ApiOperation({ summary: 'Sign up to app' })
    @ApiBody({
        type: UserDto,
        description: 'User credentials to sign up to app',
        examples: {
            a: {
                summary: 'Example credentials',
                value: {
                    username: 'gary',
                    password: 'test',
                    email: 'gary.test@polymtl.ca',
                } as UserDto,
            },
        },
    })
    async signUp(@Body() userDto: UserDto) {
        return this.authenticationService.signUp(userDto);
    }

    @Post('/refresh')
    @ApiOperation({ summary: 'Refresh token' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Token refreshed' })
    @ApiForbiddenResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized to refresh token' })
    async refreshTokens(@Body() refreshDto: RefreshDto): Promise<JwtTokensDto> {
        return await this.authenticationService.refreshTokens(refreshDto.username, refreshDto.refreshToken);
    }

    @Post('/logout')
    @ApiOperation({ summary: 'Log out of app' })
    async logOut(@Req() request: Request): Promise<void> {
        if (request.headers.username === null || request.headers.username === undefined) {
            throw new HttpException('No username given', HttpStatus.BAD_REQUEST);
        }
        const username = request.headers.username as string;
        return await this.authenticationService.logOut(username);
    }
}
