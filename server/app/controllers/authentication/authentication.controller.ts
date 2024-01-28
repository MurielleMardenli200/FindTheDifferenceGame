import { SignInDto } from '@app/model/dto/user-dto';
import { AuthenticationService } from '@app/services/authentication/authentication.service';
import { Body, Controller, Get, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Authentification')
@Controller('auth')
export class AuthenticationController {
    constructor(private authenticationService: AuthenticationService) {}

    @Post('/login')
    @ApiOperation({ summary: 'Log into app' })
    @ApiOkResponse({ status: HttpStatus.OK, description: 'Okay to log into app' })
    @ApiForbiddenResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized to sign in to app' })
    @ApiBody({
        type: SignInDto,
        description: 'User credentials to log into app',
        examples: {
            a: {
                summary: 'Example creds',
                value: {
                    username: 'gary',
                    password: 'test',
                } as SignInDto,
            },
        },
    })
    async logIn(@Body() signInDto: SignInDto): Promise<string> {
        return this.authenticationService.logIn(signInDto.username, signInDto.password);
    }

    @Post('/signup')
    @ApiOperation({ summary: 'Sign up to app' })
    @ApiBody({
        type: SignInDto,
        description: 'User credentials to sign up to app',
        examples: {
            a: {
                summary: 'Example creds',
                value: {
                    username: 'gary',
                    password: 'test',
                } as SignInDto,
            },
        },
    })
    async signUp(@Body() signInDto: SignInDto) {
        return this.authenticationService.signUp(signInDto.username, signInDto.password);
    }

    @Get('/test')
    @ApiBearerAuth('JWT-auth')
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Test authentification' })
    async test() {
        return 'test';
    }
}
