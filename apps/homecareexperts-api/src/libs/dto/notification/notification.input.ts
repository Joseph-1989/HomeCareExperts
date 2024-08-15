import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { NotificationGroup, NotificationStatus, NotificationType } from '../../enums/notification.enum';
import { IsIn, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import { availableNotificationsSorts } from '../../config';
import { Direction } from '../../enums/common.enum';

@InputType()
export class NotificationInput {
	@IsNotEmpty()
	@Field(() => NotificationType)
	notificationType: NotificationType;

	@IsOptional()
	@Field(() => NotificationStatus, { nullable: true })
	notificationStatus?: NotificationStatus;

	@IsNotEmpty()
	@Field(() => NotificationGroup)
	notificationGroup: NotificationGroup;

	@IsNotEmpty()
	@Length(3, 100)
	@Field(() => String)
	notificationTitle: string;

	@IsOptional()
	@Length(5, 500)
	@Field(() => String, { nullable: true })
	notificationDesc?: string;

	@IsNotEmpty()
	@Field(() => String)
	authorId: ObjectId;

	@IsNotEmpty()
	@Field(() => String)
	receiverId: ObjectId;

	@IsOptional()
	@Field(() => String, { nullable: true })
	targetObjectId?: ObjectId;
}

@InputType()
class NISearch {
	@IsOptional()
	@Field(() => String, { nullable: true })
	receiverId?: ObjectId;
}

@InputType()
export class NotificationsInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@IsIn(availableNotificationsSorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@Field(() => NISearch)
	search: NISearch;
}
