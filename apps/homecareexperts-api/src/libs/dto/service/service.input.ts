import { ServiceCategory, ServiceLocation, ServicePricingModel, ServiceStatus } from '../../enums/service.enum';
import { availableServiceSorts } from '../../config';
import { IsIn, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import { Field, InputType, Int } from '@nestjs/graphql';
import { Direction } from '../../enums/common.enum';
import { ObjectId } from 'mongoose';

@InputType()
export class ServiceInput {
	@IsNotEmpty()
	@Field(() => ServiceCategory)
	serviceCategory: ServiceCategory;

	@IsNotEmpty()
	@Field(() => ServiceLocation)
	serviceLocation: ServiceLocation;

	@IsNotEmpty()
	@Field(() => ServicePricingModel)
	pricingModel: ServicePricingModel;

	@IsNotEmpty()
	@Length(3, 100)
	@Field(() => String)
	serviceAddress: string;

	@IsNotEmpty()
	@Length(3, 100)
	@Field(() => String)
	serviceTitle: string;

	@IsNotEmpty()
	@Field(() => Number)
	servicePrice: number;

	@IsNotEmpty()
	@Field(() => [String])
	serviceImages: string[];

	@IsOptional()
	@Length(5, 500)
	@Field(() => String, { nullable: true })
	serviceDescription?: string;

	@IsOptional()
	@Field(() => Boolean, { nullable: true })
	assistanceDIY?: boolean;

	@IsOptional()
	@Field(() => Boolean, { nullable: true })
	subscriptionModel?: boolean;

	@IsOptional()
	@Field(() => Boolean, { nullable: true })
	emergencyServices?: boolean;

	@IsOptional()
	@Field(() => Boolean, { nullable: true })
	referralPrograms?: boolean;

	memberId: ObjectId;
}

@InputType()
export class ServiceOptionsInput {
	@Field(() => Boolean, { nullable: true })
	assistanceDIY?: boolean;

	@Field(() => Boolean, { nullable: true })
	subscriptionModel?: boolean;

	@Field(() => Boolean, { nullable: true })
	emergencyServices?: boolean;

	@Field(() => Boolean, { nullable: true })
	referralPrograms?: boolean;
}

@InputType()
export class PricesSeries {
	@Field(() => Number)
	start: number;

	@Field(() => Number)
	end: number;
}

@InputType()
export class SISearch {
	@IsOptional()
	@Field(() => String, { nullable: true })
	memberId?: ObjectId;

	@IsOptional()
	@Field(() => [ServiceStatus], { nullable: true })
	serviceStatus?: ServiceStatus[];

	@IsOptional()
	@Field(() => [ServiceLocation], { nullable: true })
	locationList?: ServiceLocation[];

	@IsOptional()
	@Field(() => [ServiceCategory], { nullable: true })
	categoryList?: ServiceCategory[];

	@IsOptional()
	@Field(() => [ServicePricingModel], { nullable: true })
	pricingModel?: ServicePricingModel[];

	@Field(() => ServiceOptionsInput, { nullable: true })
	options?: ServiceOptionsInput;

	@IsOptional()
	@Field(() => PricesSeries, { nullable: true })
	pricesSeries?: PricesSeries;

	@IsOptional()
	@Field(() => String, { nullable: true })
	text?: string;
}

@InputType()
export class ServicesInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@IsIn(availableServiceSorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@Field(() => SISearch)
	search: SISearch;
}

@InputType()
export class ASISearch {
	@IsOptional()
	@Field(() => ServiceStatus, { nullable: true })
	serviceStatus?: ServiceStatus;

	@IsOptional()
	@Field(() => String, { nullable: true })
	memberId?: ObjectId;
}

@InputType()
export class AgentServicesInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@IsIn(availableServiceSorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@Field(() => ASISearch)
	search: ASISearch;
}

@InputType()
export class ALSISearch {
	@IsOptional()
	@Field(() => [ServiceStatus], { nullable: true })
	serviceStatus?: ServiceStatus[];

	@IsOptional()
	@Field(() => [ServiceLocation], { nullable: true })
	serviceLocationList?: ServiceLocation[];

	@IsOptional()
	@Field(() => String, { nullable: true })
	memberId?: ObjectId;
}

@InputType()
export class AllServicesInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@IsIn(availableServiceSorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@Field(() => ALSISearch)
	search: ALSISearch;
}

@InputType()
export class ServiceOrdinaryInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;
}
