import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { BoardArticle, BoardArticles } from '../../libs/dto/board-article/board-article';
import { MemberService } from '../member/member.service';
import { ViewService } from '../view/view.service';
import {
	AllBoardArticlesInquiry,
	BoardArticleInput,
	BoardArticlesInquiry,
} from '../../libs/dto/board-article/board-article.input';
import { Direction, Message } from '../../libs/enums/common.enum';
import { StatisticModifier, T } from '../../libs/types/common';
import { BoardArticleStatus } from '../../libs/enums/board-article.enum';
import { ViewGroup } from '../../libs/enums/view.enum';
import { BoardArticleUpdate } from '../../libs/dto/board-article/board-article.update';
import { lookupAuthMemberLiked, lookupMember, shapeIntoMongoObjectId } from '../../libs/config';
import { LikeService } from '../like/like.service';
import { LikeInput } from '../../libs/dto/like/like.input';
import { LikeGroup } from '../../libs/enums/like.enum';
import { NotificationInput } from '../../libs/dto/notification/notification.input';
import { NotificationGroup, NotificationStatus, NotificationType } from '../../libs/enums/notification.enum';
import { NotificationService } from '../notification/notification.service';
import { Member } from '../../libs/dto/member/member';

@Injectable()
export class BoardArticleService {
	commentModel: any;
	constructor(
		@InjectModel('BoardArticle') private readonly boardArticleModel: Model<BoardArticle>,
		private readonly notificationService: NotificationService,
		private readonly memberService: MemberService,
		private readonly viewService: ViewService,
		private readonly likeService: LikeService,
	) {}

	/** createBoardArticle ============================================================================== **/

	public async createBoardArticle(memberId: ObjectId, input: BoardArticleInput): Promise<BoardArticle> {
		input.memberId = memberId;
		try {
			const result = await this.boardArticleModel.create(input);
			await this.memberService.memberStatsEditor({ _id: memberId, targetKey: 'memberArticles', modifier: 1 });
			return result;
		} catch (err) {
			console.log('Error, Service.model:', err.message);
			throw new BadRequestException(Message.CREATE_FAILED);
		}
	}

	/** getBoardArticle ============================================================================== **/

	public async getBoardArticle(memberId: ObjectId, articleId: ObjectId): Promise<BoardArticle> {
		const search: T = {
			_id: articleId,
			articleStatus: BoardArticleStatus.ACTIVE,
		};
		const targetBoardArticle: BoardArticle = await this.boardArticleModel.findOne(search).lean().exec();
		if (!targetBoardArticle) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		if (memberId) {
			const viewInput = {
				memberId: memberId,
				viewRefId: articleId,
				viewGroup: ViewGroup.ARTICLE,
			};
			const newView = await this.viewService.recordView(viewInput);
			if (newView) {
				await this.boardArticleStatsEditor({ _id: articleId, targetKey: 'articleViews', modifier: 1 });
				targetBoardArticle.articleViews++;
			}

			const likeInput = { memberId: memberId, likeRefId: articleId, likeGroup: LikeGroup.ARTICLE };
			targetBoardArticle.meLiked = await this.likeService.checkLikeExistence(likeInput); // meLiked
		}

		targetBoardArticle.memberData = await this.memberService.getMember(null, targetBoardArticle.memberId);
		return targetBoardArticle;
	}

	/** updateBoardArticle ============================================================================== **/

	public async updateBoardArticle(memberId: ObjectId, input: BoardArticleUpdate): Promise<BoardArticle> {
		const { _id, articleStatus } = input;
		const result = await this.boardArticleModel
			.findOneAndUpdate({ _id: _id, memberId: memberId, articleStatus: BoardArticleStatus.ACTIVE }, input, {
				new: true,
			})
			.exec();
		if (!result) {
			throw new InternalServerErrorException(Message.UPDATE_FAILED);
		}
		if (articleStatus === BoardArticleStatus.DELETE) {
			await this.memberService.memberStatsEditor({
				_id: memberId,
				targetKey: 'memberArticles',
				modifier: -1,
			});
		}
		return result;
	}

	/** getBoardArticles ============================================================================== **/

	public async getBoardArticles(memberId: ObjectId, input: BoardArticlesInquiry): Promise<BoardArticles> {
		const { articleCategory, text } = input.search;
		const match: any = { articleStatus: BoardArticleStatus.ACTIVE };
		const sort: any = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		if (articleCategory) match.articleCategory = articleCategory;
		if (text) match.articleTitle = { $regex: new RegExp(text, 'i') };
		if (input.search?.memberId) match.memberId = shapeIntoMongoObjectId(input.search.memberId);

		console.log('match:', match);

		const result = await this.boardArticleModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							lookupAuthMemberLiked(memberId),
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

	// MUTATION => likeTargetBoardArticle ================================================================
	public async likeTargetBoardArticle(memberId: ObjectId, likeRefId: ObjectId): Promise<BoardArticle> {
		const target: BoardArticle = await this.boardArticleModel
			.findOne({ _id: likeRefId, articleStatus: BoardArticleStatus.ACTIVE })
			.exec();
		if (!target) {
			throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		}

		const input: LikeInput = {
			memberId: memberId,
			likeRefId: likeRefId,
			likeGroup: LikeGroup.ARTICLE,
		};

		const modifier: number = await this.likeService.toggleLike(input);

		const result = await this.boardArticleStatsEditor({
			_id: likeRefId,
			targetKey: 'articleLikes',
			modifier: modifier,
		});

		if (!result) {
			throw new InternalServerErrorException(Message.SOMETHING_WENT_WRONG);
		}

		const authorDetails = await this.memberService.getMember(memberId, memberId);

		const authorName = authorDetails?.memberNick || 'Someone';

		const notificationInput: NotificationInput = {
			notificationType: NotificationType.LIKE,
			notificationStatus: NotificationStatus.WAIT,
			notificationGroup: NotificationGroup.ARTICLE,
			notificationTitle: 'New like on your article!',
			notificationDesc: `${authorName} has ${modifier > 0 ? 'liked' : 'unliked'} your article.`,
			authorId: memberId,
			receiverId: target.memberId,
			targetObjectId: likeRefId,
		};

		const createNotification = await this.notificationService.createNotification(notificationInput);

		if (!createNotification) {
			console.error('Failed to create notification');
		} else {
			console.log('Notification created successfully:', createNotification);
		}

		// const getNotifications = await this.notificationService.getNotifications(target.memberId);

		// console.log('getNotifications', getNotifications);

		// const markNotificationsAsRead = await this.notificationService.markNotificationsAsRead(target.memberId);

		// console.log('markNotificationsAsRead', markNotificationsAsRead);

		// const getUnreadNotificationCount = await this.notificationService.getUnreadNotificationCount(target.memberId);

		// console.log('getUnreadNotificationCount', getUnreadNotificationCount);

		return result;
	}

	/** ADMIN ============================================================================== **/

	/** getAllBoardArticlesByAdmin ============================================================================== **/

	public async getAllBoardArticlesByAdmin(input: AllBoardArticlesInquiry): Promise<BoardArticles> {
		const { articleStatus, articleCategory } = input.search;
		const match: T = {};
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		if (articleStatus) match.articleStatus = articleStatus;
		if (articleCategory) match.articleCategory = articleCategory;

		const result = await this.boardArticleModel.aggregate([
			{ $match: match },
			{ $sort: sort },
			{
				$facet: {
					list: [
						{ $skip: (input.page - 1) * input.limit },
						{ $limit: input.limit },
						lookupMember,
						{ $unwind: '$memberData' },
					],
					metaCounter: [{ $count: 'total' }],
				},
			},
		]);

		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result[0];
	}

	/** updateBoardArticleByAdmin ============================================================================== **/

	public async updateBoardArticleByAdmin(input: BoardArticleUpdate): Promise<BoardArticle> {
		const { _id, articleStatus } = input;
		const result = await this.boardArticleModel
			.findOneAndUpdate({ _id: _id, articleStatus: BoardArticleStatus.ACTIVE }, input, { new: true })
			.exec();

		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

		if (articleStatus === BoardArticleStatus.DELETE) {
			await this.memberService.memberStatsEditor({
				_id: result.memberId,
				targetKey: 'memberArticles',
				modifier: -1,
			});
		}

		return result;
	}

	/** removeBoardArticleByAdmin ============================================================================== **/

	public async removeBoardArticleByAdmin(articleId: ObjectId): Promise<BoardArticle> {
		const search: T = { _id: articleId, articleStatus: BoardArticleStatus.DELETE };
		const result = await this.boardArticleModel.findOneAndDelete(search).exec();
		if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);
		return result;
	}

	/** boardArticleStatsEditor ============================================================================== **/

	public async boardArticleStatsEditor(input: StatisticModifier): Promise<BoardArticle> {
		const { _id, targetKey, modifier } = input;
		return await this.boardArticleModel
			.findByIdAndUpdate({ _id: _id, [targetKey]: { $gt: 0 } }, { $inc: { [targetKey]: modifier } }, { new: true })
			.exec();
	}
}
