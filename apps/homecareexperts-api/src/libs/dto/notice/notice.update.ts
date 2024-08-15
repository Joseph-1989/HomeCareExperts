import { Field, InputType } from '@nestjs/graphql';
import { NoticeCategory, NoticeStatus } from '../../enums/notice.enum';
import { ObjectId } from 'mongoose';

@InputType()
export class NoticeUpdate {
	@Field(() => String)
	_id: string;

	@Field(() => NoticeCategory, { nullable: true })
	noticeCategory?: NoticeCategory;

	@Field(() => NoticeStatus, { nullable: true })
	noticeStatus?: NoticeStatus;

	@Field(() => String, { nullable: true })
	noticeTitle?: string;

	@Field(() => String, { nullable: true })
	noticeContent?: string;

	@Field(() => String, { nullable: true })
	memberId?: ObjectId;
}
