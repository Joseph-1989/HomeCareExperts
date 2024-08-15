import { ServiceCategory, ServiceLocation, ServicePricingModel, ServiceStatus } from '../../enums/service.enum';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Member } from '../member/member';
import { ObjectId } from 'mongoose';
import { MeLiked } from '../like/like';
import { TotalCounter } from '../../types/common';

@ObjectType()
export class Service {
	@Field(() => String)
	_id: ObjectId;

	@Field(() => ServiceCategory)
	serviceCategory: ServiceCategory;

	@Field(() => ServiceStatus)
	serviceStatus: ServiceStatus;

	@Field(() => ServiceLocation)
	serviceLocation: ServiceLocation;

	@Field(() => ServicePricingModel)
	pricingModel: ServicePricingModel;

	@Field(() => String)
	serviceAddress: string;

	@Field(() => String)
	serviceTitle: string;

	@Field(() => Number)
	servicePrice: number;

	@Field(() => Boolean)
	assistanceDIY: boolean;

	@Field(() => Boolean)
	subscriptionModel: boolean;

	@Field(() => Boolean)
	emergencyServices: boolean;

	@Field(() => Boolean)
	referralPrograms: boolean;

	@Field(() => Int)
	serviceViews: number;

	@Field(() => Int)
	serviceLikes: number;

	@Field(() => Int)
	serviceComments: number;

	@Field(() => Int)
	serviceRank: number;

	@Field(() => [String])
	serviceImages: string[];

	@Field(() => String, { nullable: true })
	serviceDescription?: string;

	@Field(() => String)
	memberId: ObjectId;

	@Field(() => Date, { nullable: true })
	stoppedAt?: Date; // Optional, if assigned

	@Field(() => Date, { nullable: true })
	deletedAt?: Date; // Optional, if assigned

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;

	/** from aggregation **/
	@Field(() => [MeLiked], { nullable: true })
	meLiked?: MeLiked[]; // Eagerly load provider data

	@Field(() => Member, { nullable: true })
	memberData?: Member; // Eagerly load member data
}

@ObjectType()
export class Services {
	@Field(() => [Service])
	list: Service[];

	@Field(() => [TotalCounter], { nullable: true })
	metaCounter: TotalCounter[];
}
