import { Injectable, BadRequestException, InternalServerErrorException, ConflictException } from '@nestjs/common';
import { lookupAuthMemberLiked, lookupMember, shapeIntoMongoObjectId } from '../../libs/config';
import { StatisticModifier, T } from '../../libs/types/common';
import { ServiceUpdateInput } from '../../libs/dto/service/service.update';
import { Direction, Message } from '../../libs/enums/common.enum';
import { Service, Services } from '../../libs/dto/service/service';
import { Model, ObjectId } from 'mongoose';
import { MemberService } from '../member/member.service';
import { ServiceStatus } from '../../libs/enums/service.enum';
import { InjectModel } from '@nestjs/mongoose';
import { ViewService } from '../view/view.service';
import { LikeService } from '../like/like.service';
import { LikeInput } from '../../libs/dto/like/like.input';
import { ViewGroup } from '../../libs/enums/view.enum';
import { LikeGroup } from '../../libs/enums/like.enum';
import {
	AgentServicesInquiry,
	AllServicesInquiry,
	ServiceOrdinaryInquiry,
	ServiceInput,
	ServicesInquiry,
	SISearch,
	ASISearch,
	ALSISearch,
} from '../../libs/dto/service/service.input';
import * as moment from 'moment';
import { NotificationService } from '../notification/notification.service';
import { NotificationGroup, NotificationStatus, NotificationType } from '../../libs/enums/notification.enum';
import { NotificationInput } from '../../libs/dto/notification/notification.input';

@Injectable()
export class ServiceService {
	constructor(
		@InjectModel('Service') private readonly serviceModel: Model<Service>,
		private notificationService: NotificationService,
		private memberService: MemberService,
		private viewService: ViewService,
		private likeService: LikeService,
	) {}

	// MUTATION => createService ================================================================

	public async createService(input: ServiceInput): Promise<Service> {
		try {
			const result = await this.serviceModel.create(input);
			console.log('input', input);
			await this.memberService.memberStatsEditor({ _id: result.memberId, targetKey: 'memberServices', modifier: 1 });
			return result;
		} catch (err) {
			console.log('Error, service.service.model.ts:', err.message);
			throw new BadRequestException(Message.CREATE_FAILED);
		}
	}

	// QUERY => getService ================================================================

	public async getService(memberId: ObjectId, serviceId: ObjectId): Promise<Service> {
		const search: T = {
			_id: serviceId,
			serviceStatus: ServiceStatus.AVAILABLE,
		};
		const targetService: Service = await this.serviceModel.findOne(search).lean().exec();

		if (!targetService) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		if (memberId) {
			const viewInput = { memberId: memberId, viewRefId: serviceId, viewGroup: ViewGroup.SERVICE };
			const newView = await this.viewService.recordView(viewInput);
			if (newView) {
				await this.serviceStatsEditor({ _id: serviceId, targetKey: 'serviceViews', modifier: 1 });
				targetService.serviceViews++;
			}
			// meLiked
			const likeInput = { memberId: memberId, likeRefId: serviceId, likeGroup: LikeGroup.SERVICE };
			targetService.meLiked = await this.likeService.checkLikeExistence(likeInput);
		}

		targetService.memberData = await this.memberService.getMember(null, targetService.memberId);
		return targetService;
	}

	// MUTATION => updateService ================================================================

	public async updateService(memberId: ObjectId, input: ServiceUpdateInput): Promise<Service> {
		let { serviceStatus, stoppedAt, deletedAt } = input;
		const search: T = {
			_id: input._id,
			memberId: memberId,
			serviceStatus: ServiceStatus.AVAILABLE,
		};
		if (serviceStatus == ServiceStatus.NOT_AVAILABLE) stoppedAt = moment().toDate();
		else if (serviceStatus === ServiceStatus.DELETED) deletedAt = moment().toDate();
		const result = await this.serviceModel.findOneAndUpdate(search, input, { new: true }).exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);
		if (stoppedAt || deletedAt) {
			await this.memberService.memberStatsEditor({
				_id: memberId,
				targetKey: 'memberServices',
				modifier: -1,
			});
		}
		return result;
	}

	// QUERY => getServices ================================================================

	public async getServices(memberId: ObjectId, input: ServicesInquiry): Promise<Services> {
		const match: any = { serviceStatus: ServiceStatus.AVAILABLE };
		const sort: any = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		const { search } = input;

		// Apply location filters
		if (search.locationList && search.locationList.length) {
			match.serviceLocation = { $in: search.locationList };
		}

		// Apply category filters
		if (search.categoryList && search.categoryList.length) {
			match.serviceCategory = { $in: search.categoryList };
		}

		// Apply pricing model filters
		if (search.pricingModel && search.pricingModel.length) {
			match.pricingModel = { $in: search.pricingModel };
		}

		// Apply options filters
		if (search.options) {
			if (search.options.assistanceDIY !== undefined) {
				match.assistanceDIY = search.options.assistanceDIY;
			}
			if (search.options.subscriptionModel !== undefined) {
				match.subscriptionModel = search.options.subscriptionModel;
			}
			if (search.options.emergencyServices !== undefined) {
				match.emergencyServices = search.options.emergencyServices;
			}
			if (search.options.referralPrograms !== undefined) {
				match.referralPrograms = search.options.referralPrograms;
			}
		}

		// Apply price range filter
		if (search.pricesSeries) {
			match.servicePrice = {
				$gte: search.pricesSeries.start,
				$lte: search.pricesSeries.end,
			};
		}

		// Apply text search filter
		if (search.text) {
			match.serviceTitle = { $regex: search.text, $options: 'i' };
		}

		// Execute the query using aggregation
		const result = await this.serviceModel
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

		// Return the result directly, even if empty
		return {
			list: result[0]?.list || [],
			metaCounter: result[0]?.metaCounter || [{ total: 0 }],
		};
	}

	// QUERY => getMemberServices ================================================================

	public async getMemberServices(input: ServicesInquiry): Promise<Services> {
		const match: any = {}; // Initialize the match object

		// Apply the memberId filter directly within the match object
		this.shapeMatchQuery(match, input);

		console.log('Match Object:', match); // Log the match object for debugging

		const sort: any = { createdAt: input?.direction ?? Direction.DESC }; // Default sorting by creation date

		const result = await this.serviceModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [{ $skip: (input.page - 1) * input.limit }, { $limit: input.limit }],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result[0];
	}

	// MUTATION => shapeMatchQuery ================================================================

	private shapeMatchQuery(match: any, input: ServicesInquiry): void {
		const { search } = input;

		// Ensure that the match query always filters by memberId
		if (search.memberId) {
			match.memberId = shapeIntoMongoObjectId(search.memberId);
		}

		// Handle service location filtering
		if (search.locationList && search.locationList.length) {
			match.serviceLocation = { $in: search.locationList };
		}

		// Handle service category filtering
		if (search.categoryList && search.categoryList.length) {
			match.serviceCategory = { $in: search.categoryList };
		}

		// Handle service pricing model filtering
		if (search.pricingModel && search.pricingModel.length) {
			match.pricingModel = { $in: search.pricingModel };
		}

		// Handle price range filtering
		if (search.pricesSeries) {
			match.servicePrice = { $gte: search.pricesSeries.start, $lte: search.pricesSeries.end };
		}

		// Handle text search on service title
		if (search.text) {
			match.serviceTitle = { $regex: new RegExp(search.text, 'i') };
		}

		// Handle service options (e.g., assistanceDIY, subscriptionModel, etc.)
		if (search.options) {
			const optionKeys = Object.keys(search.options).filter((key) => search.options[key]);
			if (optionKeys.length > 0) {
				match['$or'] = optionKeys.map((key) => {
					return { [key]: true };
				});
			}
		}

		// Handle service status filtering
		if (search.serviceStatus) {
			if (Array.isArray(search.serviceStatus)) {
				match.serviceStatus = { $in: search.serviceStatus };
			} else {
				match.serviceStatus = search.serviceStatus;
			}
		}
	}

	// QUERY => getFavorites ================================================================

	public async getFavorites_Service(memberId: ObjectId, input: ServiceOrdinaryInquiry): Promise<Services> {
		console.log('Query: getFavorites_Service');
		return await this.likeService.getFavoriteServices(memberId, input);
	}

	// QUERY => getVisited ================================================================

	public async getVisited_Service(memberId: ObjectId, input: ServiceOrdinaryInquiry): Promise<Services> {
		console.log('Query: getVisited_Service');
		return await this.viewService.getVisitedServices(memberId, input);
	}
	// QUERY => getAgentServices ================================================================

	public async getAgentServices(memberId: ObjectId, input: AgentServicesInquiry): Promise<Services> {
		const { serviceStatus } = input.search;
		if (serviceStatus === ServiceStatus.NOT_AVAILABLE) {
			throw new BadRequestException(Message.NOT_ALLOWED_REQUEST);
		}

		const match: T = {
			memberId: memberId,
			serviceStatus: serviceStatus ?? { $ne: ServiceStatus.AVAILABLE },
		};

		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		const result = await this.serviceModel
			.aggregate([
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
			])
			.exec();

		if (!result.length) {
			throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		}

		return result[0];
	}

	// QUERY => likeTargetService ================================================================

	public async likeTargetService(memberId: ObjectId, likeRefId: ObjectId): Promise<Service> {
		const target: Service = await this.serviceModel
			.findOne({
				_id: likeRefId,
				serviceStatus: ServiceStatus.AVAILABLE,
			})
			.exec();

		if (!target) {
			throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		}

		const input: LikeInput = {
			memberId: memberId,
			likeRefId: likeRefId,
			likeGroup: LikeGroup.SERVICE,
		};

		const modifier: number = await this.likeService.toggleLike(input);
		const result = await this.serviceModel
			.findOneAndUpdate({ _id: likeRefId }, { $inc: { serviceLikes: modifier } }, { new: true })
			.exec();

		if (!result) {
			throw new InternalServerErrorException(Message.SOMETHING_WENT_WRONG);
		}

		const authorDetails = await this.memberService.getMember(memberId, memberId);

		const authorName = authorDetails?.memberNick || 'Someone';

		const notificationInput: NotificationInput = {
			notificationType: NotificationType.LIKE,
			notificationStatus: NotificationStatus.WAIT,
			notificationGroup: NotificationGroup.ARTICLE,
			notificationTitle: 'New like on your service!',
			notificationDesc: `${authorName} has ${modifier > 0 ? 'liked' : 'unliked'} your service.`,
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

	// QUERY => getAllServicesByAdmin ================================================================

	public async getAllServicesByAdmin(input: AllServicesInquiry): Promise<Services> {
		const { serviceStatus, serviceLocationList } = input.search;
		const match: T = {};
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		if (serviceStatus) match.serviceStatus = serviceStatus;

		if (serviceLocationList) match.serviceLocation = { $in: serviceLocationList };

		const result = await this.serviceModel
			.aggregate([
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
			])
			.exec();

		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result[0];
	}

	// MUTATION => updateServiceByAdmin ================================================================

	public async updateServiceByAdmin(input: ServiceUpdateInput): Promise<Service> {
		let { serviceStatus, stoppedAt, deletedAt } = input;
		const search: T = {
			_id: input._id,
			serviceStatus: ServiceStatus.AVAILABLE,
		};

		if (serviceStatus === ServiceStatus.NOT_AVAILABLE) {
			stoppedAt = moment().toDate();
		} else if (serviceStatus === ServiceStatus.DELETED) {
			deletedAt = moment().toDate();
		}

		const result = await this.serviceModel.findOneAndUpdate(search, input, { new: true });

		if (!result) {
			throw new InternalServerErrorException(Message.UPDATE_FAILED);
		}

		if (stoppedAt || deletedAt) {
			await this.memberService.memberStatsEditor({
				_id: result.memberId,
				targetKey: 'memberServices',
				modifier: -1,
			});
		}

		return result;
	}

	// MUTATION => removeServiceByAdmin ================================================================

	public async removeServiceByAdmin(serviceId: ObjectId): Promise<Service> {
		const search: T = {
			_id: serviceId,
			serviceStatus: ServiceStatus.NOT_AVAILABLE,
		};

		const result = await this.serviceModel.findOneAndDelete(search).exec();

		if (!result) {
			throw new InternalServerErrorException(Message.REMOVE_FAILED);
		}

		return result;
	}

	// MUTATION => serviceStatsEditor ================================================================

	public async serviceStatsEditor(input: StatisticModifier): Promise<Service> {
		const { _id, targetKey, modifier } = input;
		return await this.serviceModel.findByIdAndUpdate(_id, { $inc: { [targetKey]: modifier } }, { new: true }).exec();
	}
}
