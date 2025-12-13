import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HoagiesController } from './hoagies.controller';
import { HoagiesService } from './hoagies.service';
import { Hoagie, HoagieSchema } from './schemas/hoagie.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Hoagie.name, schema: HoagieSchema }]),
    UsersModule,
  ],
  controllers: [HoagiesController],
  providers: [HoagiesService],
  exports: [HoagiesService],
})
export class HoagiesModule {}
