import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { NotificationGroup, NotificationStatus, NotificationType } from '../../enums/notification.enum';
import { TotalCounter } from '../../types/common';

@ObjectType()
export class NotificationStructure {
	@Field(() => String)
	_id: ObjectId;

	@Field(() => NotificationType)
	notificationType: NotificationType;

	@Field(() => NotificationStatus)
	notificationStatus: NotificationStatus;

	@Field(() => NotificationGroup)
	notificationGroup: NotificationGroup;

	@Field(() => String)
	notificationTitle: string;

	@Field(() => String)
	notificationDesc: string;

	@Field(() => String)
	authorId: ObjectId;

	@Field(() => String)
	receiverId: ObjectId;

	@Field(() => String, { nullable: true })
	targetObjectId?: ObjectId;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;
}

@ObjectType()
export class Notifications {
	@Field(() => [NotificationStructure])
	list: NotificationStructure[];

	@Field(() => [TotalCounter], { nullable: true })
	metaCounter: TotalCounter[];
}
