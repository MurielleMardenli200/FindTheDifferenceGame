import { User, userSchema } from '@app/model/database/user.entity';
import { UserService } from '@app/services/user/user.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
    imports: [MongooseModule.forFeature([{ name: User.name, schema: userSchema }])],
    providers: [UserService],
    exports: [UserService],
})
export class UsersModule {}
