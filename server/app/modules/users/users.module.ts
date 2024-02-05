import { User } from '@app/model/database/user.entity';
import { UserService } from '@app/services/user/user.service';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [ConfigModule.forRoot({ isGlobal: true, envFilePath: ['@app/.env'] }), TypeOrmModule.forFeature([User])],
    providers: [UserService],
    exports: [UserService],
})
export class UsersModule {}
