import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import CommentSchema from '../../schemas/Comment.model';
import { MemberModule } from '../member/member.module';
import { PropertyModule } from '../property/property.module';
import { BoardArticleModule } from '../board-article/board-article.module';
import { CommentResolver } from './comment.resolver';
import { CommentService } from './comment.service';
import { ServiceModule } from '../service/service.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: 'Comment', schema: CommentSchema }]),
		AuthModule,
		MemberModule,
		PropertyModule,
		BoardArticleModule,
		ServiceModule,
		NotificationModule,
	],
	providers: [CommentResolver, CommentService],
	exports: [CommentService],
})
export class CommentModule {}
