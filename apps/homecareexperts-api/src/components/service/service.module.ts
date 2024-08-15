import { Module } from '@nestjs/common';
import { ServiceResolver } from './service.resolver';
import { ServiceService } from './service.service';
import { AuthModule } from '../auth/auth.module';
import { ViewModule } from '../view/view.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MemberModule } from '../member/member.module';
import { LikeModule } from '../like/like.module';
import ServiceSchema from '../../schemas/Service.model';
import { NotificationModule } from '../notification/notification.module';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: 'Service', schema: ServiceSchema }]),
		AuthModule,
		ViewModule,
		MemberModule,
		LikeModule,
		NotificationModule,
	],
	providers: [ServiceResolver, ServiceService],
	exports: [ServiceService],
})
export class ServiceModule {}
