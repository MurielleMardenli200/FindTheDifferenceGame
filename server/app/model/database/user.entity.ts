import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { UserInterface } from '@common/user';

@Schema()
export class User implements UserInterface {
    @Prop({ required: true })
    username: string;

    @Prop({ required: true })
    password: string;

    @Transform(({ value }: { value: string }) => value.toString(), { toPlainOnly: true })
    _id?: string;
    constructor(username: string, password: string) {
        this.username = username;
        this.password = password;
    }
}
export type UserDocument = User & Document;

export const userSchema = SchemaFactory.createForClass(User);
userSchema.loadClass(User);
