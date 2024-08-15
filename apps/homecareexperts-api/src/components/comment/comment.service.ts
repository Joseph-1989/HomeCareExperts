import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { MemberService } from '../member/member.service';
import { PropertyService } from '../property/property.service';
import { BoardArticleService } from '../board-article/board-article.service';
import { CommentInput, CommentsInquiry } from '../../libs/dto/comment/comment.input';
import { Direction, Message } from '../../libs/enums/common.enum';
import { CommentGroup, CommentStatus } from '../../libs/enums/comment.enum';
import { Comment, Comments } from '../../libs/dto/comment/comment';
import { CommentUpdate } from '../../libs/dto/comment/comment.update';
import { lookupMember } from '../../libs/config';
import { ServiceService } from '../service/service.service';
import { NotificationInput } from '../../libs/dto/notification/notification.input';
import { NotificationGroup, NotificationStatus, NotificationType } from '../../libs/enums/notification.enum';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class CommentService {
	constructor(
		@InjectModel('Comment') private readonly commentModel: Model<Comment>,
		private readonly memberService: MemberService,
		private readonly propertyService: PropertyService,
		private readonly boardArticleService: BoardArticleService,
		private readonly serviceService: ServiceService,
		private readonly notificationService: NotificationService,
	) {}

	/** createComment ============================================================================== **/

	public async createComment(memberId: ObjectId, input: CommentInput): Promise<Comment> {
		input.memberId = memberId;
		const targetObjectId = input.commentRefId;
		const target: Comment = await this.commentModel
			.findOne({ memberId: memberId, commentStatus: CommentStatus.ACTIVE })
			.exec();

		let result = null;
		try {
			result = await this.commentModel.create(input);
			console.log('result', result);

			if (result) {
				const authorDetails = await this.memberService.getMember(memberId, memberId);

				const authorName = authorDetails?.memberNick || 'Someone';

				const notificationInput: NotificationInput = {
					notificationType: NotificationType.COMMENT,
					notificationStatus: NotificationStatus.WAIT,
					notificationGroup: NotificationGroup.COMMENT,
					notificationTitle: 'New comment!',
					notificationDesc: `${authorName} has commented.`,
					authorId: memberId,
					receiverId: target.memberId,
					targetObjectId: targetObjectId,
				};

				const createNotification = await this.notificationService.createNotification(notificationInput);

				if (!createNotification) {
					console.error('Failed to create notification');
				} else {
					console.log('Notification created successfully:', createNotification);
				}
			}
		} catch (err) {
			console.log('Error, Service.model:', err.message);
			throw new BadRequestException(Message.CREATE_FAILED);
		}
		switch (input.commentGroup) {
			case CommentGroup.SERVICE:
				await this.serviceService.serviceStatsEditor({
					_id: input.commentRefId,
					targetKey: 'serviceComments',
					modifier: 1,
				});
				break;
			case CommentGroup.PROPERTY:
				await this.propertyService.propertyStatsEditor({
					_id: input.commentRefId,
					targetKey: 'propertyComments',
					modifier: 1,
				});
				break;
			case CommentGroup.ARTICLE:
				await this.boardArticleService.boardArticleStatsEditor({
					_id: input.commentRefId,
					targetKey: 'boardArticleComments',
					modifier: 1,
				});
				break;
			case CommentGroup.MEMBER:
				await this.memberService.memberStatsEditor({
					_id: input.commentRefId,
					targetKey: 'memberComments',
					modifier: 1,
				});
				break;
		}

		if (!result) throw new InternalServerErrorException(Message.CREATE_FAILED);
		return result;
	}

	/** updateComment ============================================================================== **/

	public async updateComment(memberId: ObjectId, input: CommentUpdate): Promise<Comment> {
		const { _id } = input;
		const result = await this.commentModel
			.findOneAndUpdate({ _id: _id, memberId: memberId, commentStatus: CommentStatus.ACTIVE }, input, { new: true })
			.exec();

		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

		return result;
	}

	/** getComments ============================================================================== **/

	public async getComments(memberId: ObjectId, input: CommentsInquiry): Promise<Comments> {
		const { commentRefId } = input.search;
		const match = { commentRefId, commentStatus: CommentStatus.ACTIVE };
		const sort = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		const result = await this.commentModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							// meLiked
							lookupMember,
							{ $unwind: '$memberData' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result[0];
	}

	/** ADMIN **/

	/** removeCommentByAdmin ============================================================================== **/

	public async removeCommentByAdmin(input: ObjectId): Promise<Comment> {
		const result = await this.commentModel.findByIdAndDelete(input).exec();
		if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);
		return result;
	}
}
