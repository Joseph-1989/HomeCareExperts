import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { NoticeService } from './notice.service';
import { Notice, Notices } from '../../libs/dto/notice/notice';
import { NoticeInput, NoticeInquiry } from '../../libs/dto/notice/notice.input';
import { NoticeUpdate } from '../../libs/dto/notice/notice.update';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { shapeIntoMongoObjectId } from '../../libs/config';
import mongoose, { ObjectId } from 'mongoose';
import { NoticeCategory, NoticeStatus } from '../../libs/enums/notice.enum';

@Resolver(() => Notice)
export class NoticeResolver {
	constructor(private readonly noticeService: NoticeService) {}

	@Query(() => Notices)
	async getNotices(@Args('inquiry') inquiry: NoticeInquiry): Promise<Notices> {
		if (inquiry.search.memberId) {
			inquiry.search.memberId = shapeIntoMongoObjectId(inquiry.search.memberId);
		}

		return await this.noticeService.findAll(inquiry);
	}

	@Query(() => Notice)
	async getNotice(@Args('id', { type: () => String }) id: string): Promise<Notice> {
		return this.noticeService.findOne(id);
	}

	@Mutation(() => Notice)
	async createNotice(@Args('input') input: NoticeInput): Promise<Notice> {
		const memberIdString = input.memberId.toString();

		if (!mongoose.Types.ObjectId.isValid(memberIdString)) {
			throw new Error('Invalid memberId');
		}

		input.memberId = shapeIntoMongoObjectId(memberIdString);

		if (!input.noticeTitle) throw new Error('noticeTitle is required');
		if (!input.noticeContent) throw new Error('noticeContent is required');
		if (!input.memberId) throw new Error('memberId is required');
		if (!input.noticeStatus) throw new Error('noticeStatus is required');
		if (!input.noticeCategory) throw new Error('noticeCategory is required');

		if (!input.noticeStatus) input.noticeStatus = NoticeStatus.ACTIVE;
		if (!input.noticeCategory) input.noticeCategory = NoticeCategory.FAQ;
		return this.noticeService.create(input);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Notice)
	async updateNotice(@AuthMember('_id') memberId: string, @Args('input') input: NoticeUpdate): Promise<Notice> {
		return this.noticeService.update(input._id, memberId, input);
	}

	@Mutation(() => Notice)
	async deleteNotice(@Args('id') id: string): Promise<Notice> {
		const memberIdString = id.toString();

		if (!mongoose.Types.ObjectId.isValid(memberIdString)) {
			throw new Error('Invalid memberId');
		}

		id = shapeIntoMongoObjectId(memberIdString);

		return this.noticeService.remove(id);
	}
}
