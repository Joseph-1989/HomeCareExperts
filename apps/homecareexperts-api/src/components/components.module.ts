import { Module } from '@nestjs/common';
import { MemberModule } from './member/member.module';
import { PropertyModule } from './property/property.module';
import { AuthModule } from './auth/auth.module';
import { CommentModule } from './comment/comment.module';
import { LikeModule } from './like/like.module';
import { ViewModule } from './view/view.module';
import { FollowModule } from './follow/follow.module';
import { BoardArticleModule } from './board-article/board-article.module';
import { ServiceModule } from './service/service.module';
import { NotificationModule } from './notification/notification.module';
import { NoticeModule } from './notice/notice.module';
import { FaqModule } from './faq/faq.module';

@Module({
	imports: [
		MemberModule,
		PropertyModule,
		AuthModule,
		CommentModule,
		LikeModule,
		ViewModule,
		FollowModule,
		BoardArticleModule,
		ServiceModule,
		NotificationModule,
		NoticeModule,
		FaqModule,
	],
})
export class ComponentsModule {}
