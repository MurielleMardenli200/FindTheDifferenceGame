import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigurationController } from './controllers/configuration/configuration.controller';
import { GameController } from './controllers/game/game.controller';
import { ConfigurationGateway } from './gateways/configuration/configuration.gateway';
import { GameCreateGateway } from './gateways/game-create/game-create.gateway';
import { GameSessionGateway } from './gateways/game-session/game-session.gateway';
import { GameConstants } from './model/database/game-constants.entity';
import { History } from './model/database/game-history.entity';
import { Game } from './model/database/game.entity';
import { BitmapService } from './services/bitmap/bitmap.service';
import { DifferencesService } from './services/differences/differences.service';
import { FileService } from './services/file/file.service';
import { GameConstantsService } from './services/game-constants/game-constants.service';
import { GameHistoryService } from './services/game-history/game-history.service';
import { GameManagerService } from './services/game-manager/game-manager.service';
import { GameService } from './services/game/game.service';
import { HintService } from './services/hints/hint.service';
import { MessageFormatterService } from './services/message-formatter/message-formatter.service';
import { WaitingRoomService } from './services/waiting-room/waiting-room.service';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        // MongooseModule.forRootAsync({
        //     imports: [ConfigModule],
        //     inject: [ConfigService],
        //     useFactory: async (config: ConfigService) => ({
        //         uri: config.get<string>('DATABASE_CONNECTION_STRING'), // Loaded from .env
        //     }),
        // }),
        // MongooseModule.forFeature([
        //     { name: Game.name, schema: gameSchema },
        //     { name: GameConstants.name, schema: gameConstantsSchema },
        //     { name: History.name, schema: gameHistorySchema },
        // ]),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get<string>('DB_HOST'),
                port: configService.get<number>('DB_PORT'),
                username: configService.get<string>('DB_USERNAME'),
                password: configService.get<string>('DB_PASSWORD'),
                database: configService.get<string>('DB_DATABASE'),
                entities: [Game, GameConstants, History],
                synchronize: true, // TODO: Set to false
            }),
        }),
        TypeOrmModule.forFeature([
            Game,
            GameConstants,
            History,
        ]),
    ],
    controllers: [GameController, ConfigurationController],
    providers: [
        Logger,
        BitmapService,
        GameService,
        ConfigurationGateway,
        DifferencesService,
        GameSessionGateway,
        FileService,
        GameCreateGateway,
        MessageFormatterService,
        WaitingRoomService,
        GameManagerService,
        GameConstantsService,
        HintService,
        GameHistoryService,
    ],
})
export class AppModule {}
