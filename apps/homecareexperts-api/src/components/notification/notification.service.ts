import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { NotificationInput, NotificationsInquiry } from '../../libs/dto/notification/notification.input';
import { Notifications, NotificationStructure } from '../../libs/dto/notification/notification';
import { NotificationStatus } from '../../libs/enums/notification.enum';
import { UpdateResult } from 'mongodb';

@Injectable()
export class NotificationService {
	constructor(@InjectModel('Notification') private readonly notificationModel: Model<NotificationStructure>) {}

	public async createNotification(input: NotificationInput): Promise<NotificationStructure> {
		try {
			// 1. Create a new notification document
			const newNotification = new this.notificationModel({
				...input,
				createdAt: new Date(),
				updatedAt: new Date(),
			});

			// 2. Save the notification to the database
			const savedNotification = await newNotification.save();

			// Optionally, increment the user's notification count
			// await this.memberService.incrementNotificationCount(input.receiverId);

			// 3. Optionally, you could perform additional actions here, such as:
			// - Sending a real-time notification to the user
			// - Updating user's notification count
			// await this.memberService.incrementNotificationCount(notificationInput.receiverId);

			// 4. Return the saved notification
			return savedNotification;
		} catch (error) {
			// Handle any errors that occur during the process
			console.error('Error creating notification:', error);
			throw new Error('Failed to create notification');
		}
	}

	public async updateNotificationStatus(
		notificationId: String,
		status: NotificationStatus,
	): Promise<NotificationStructure> {
		const updatedNotification = await this.notificationModel.findByIdAndUpdate(
			notificationId,
			{ notificationStatus: status, updatedAt: new Date() },
			{ new: true },
		);

		if (!updatedNotification) {
			throw new NotFoundException(`Notification with ID ${notificationId} not found`);
		}

		return updatedNotification;
	}

	public async getNotifications(input: NotificationsInquiry): Promise<Notifications> {
		// Assuming input has necessary filters, e.g., receiverId, pagination, etc.
		const { search, page = 1, limit = 10, sort = 'createdAt' } = input;
		const { receiverId } = search || {};

		// Example query with potential filters
		const query = receiverId ? { receiverId } : {};

		const totalCount = await this.notificationModel.countDocuments(query).exec();

		// Fetch notifications from the database
		const notifications = await this.notificationModel
			.find(query)
			.sort({ [sort]: -1 }) // Sort by 'createdAt' field in descending order
			.skip((page - 1) * limit)
			.limit(limit)
			.exec();

		// Return the result in the expected structure
		return {
			list: notifications,
			metaCounter: [{ total: totalCount }],
		};
	}

	// public async markNotificationsAsRead(userId: ObjectId): Promise<{ modifiedCount: number }> {
	// 	const result: UpdateResult = await this.notificationModel
	// 		.updateMany({ receiverId: userId, notificationStatus: 'WAIT' }, { $set: { notificationStatus: 'READ' } })
	// 		.exec();

	// 	return { modifiedCount: result.modifiedCount };
	// }

	// public async deleteNotification(notificationId: String): Promise<void> {
	// 	const result = await this.notificationModel.deleteOne({ _id: notificationId });
	// 	if (result.deletedCount === 0) {
	// 		throw new NotFoundException(`Notification with ID ${notificationId} not found`);
	// 	}
	// }

	// public async getUnreadNotificationCount(userId: ObjectId): Promise<number> {
	// 	return this.notificationModel.countDocuments({
	// 		receiverId: userId,
	// 		notificationStatus: NotificationStatus.WAIT,
	// 	});
	// }
}
