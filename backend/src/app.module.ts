import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { HoagiesModule } from './hoagies/hoagies.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URL!),
    AuthModule,
    UsersModule,
    HoagiesModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
