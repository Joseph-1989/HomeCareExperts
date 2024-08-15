import { Resolver, Mutation, Args, Query, Int } from '@nestjs/graphql';
import { NotificationService } from './notification.service';
import { ObjectId, Types } from 'mongoose';
import { Notifications, NotificationStructure } from '../../libs/dto/notification/notification';
import { NotificationsInquiry } from '../../libs/dto/notification/notification.input';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { AuthMember } from '../auth/decorators/authMember.decorator';

@Resolver('Notification')
export class NotificationResolver {
	constructor(private readonly notificationService: NotificationService) {}

	@Query(() => Notifications)
	public async getNotifications(@Args('input') input: NotificationsInquiry): Promise<Notifications> {
		console.log(`Fetching notifications for receiver ID: ${input}`);
		const { receiverId } = input.search || {};
		console.log('receiverId', receiverId);
		// Convert receiverId to ObjectId if it's a valid string
		const receiverObjectId = shapeIntoMongoObjectId(receiverId);
		console.log('receiverObjectId', receiverObjectId);
		const notifications = await this.notificationService.getNotifications({
			...input,
			search: { receiverId: receiverObjectId },
		});
		console.log(`Notifications received: ${notifications.list.length}`);
		return notifications;
	}

	// @Query(() => Int)
	// public async unreadNotificationCount(@Args('userId') userId: ObjectId): Promise<number> {
	// 	return this.notificationService.getUnreadNotificationCount(userId);
	// }

	// @Mutation(() => Boolean)
	// public async markNotificationsAsRead(@Args('userId') userId: ObjectId): Promise<boolean> {
	// 	const result = await this.notificationService.markNotificationsAsRead(userId);
	// 	return result.modifiedCount > 0;
	// }
}
