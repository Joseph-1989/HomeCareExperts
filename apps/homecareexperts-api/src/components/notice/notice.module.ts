import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NoticeService } from './notice.service';
import { NoticeResolver } from './notice.resolver';
import { Notice } from '../../libs/dto/notice/notice';
import NoticeSchema from '../../schemas/Notice.model';
import { AuthModule } from '../auth/auth.module';

@Module({
	imports: [MongooseModule.forFeature([{ name: Notice.name, schema: NoticeSchema }]), AuthModule],
	providers: [NoticeService, NoticeResolver],
})
export class NoticeModule {}
