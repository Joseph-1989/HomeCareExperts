import { IsNotEmpty, IsOptional, IsNumber, IsPositive, MaxLength, Length } from 'class-validator';
import { ServiceCategory, ServiceLocation, ServicePricingModel, ServiceStatus } from '../../enums/service.enum'; // Assuming you have an enum for service categories
import { Field, InputType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';

@InputType()
export class ServiceUpdateInput {
	@IsNotEmpty()
	@Field(() => String)
	_id: ObjectId;

	@IsOptional()
	@Field(() => ServiceCategory, { nullable: true })
	serviceCategory?: ServiceCategory;

	@IsOptional()
	@Field(() => ServiceStatus, { nullable: true })
	serviceStatus?: ServiceStatus;

	@IsOptional()
	@Field(() => ServiceLocation, { nullable: true })
	serviceLocation?: ServiceLocation;

	@IsOptional()
	@Field(() => ServicePricingModel, { nullable: true })
	pricingModel?: ServicePricingModel;

	@IsOptional()
	@MaxLength(255)
	@Field(() => String, { nullable: true })
	serviceAddress?: string;

	@IsOptional()
	@MaxLength(255)
	@Field(() => String, { nullable: true })
	serviceTitle?: string;

	@IsOptional()
	@MaxLength(1000)
	@Length(5, 500) // Adjust max length as needed
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

	@IsOptional()
	@IsNumber()
	@IsPositive()
	@Field(() => Number, { nullable: true })
	servicePrice?: number;

	@IsOptional()
	@Field(() => [String], { nullable: true })
	serviceImages?: string[];

	stoppedAt?: Date; // To mark a service as stopped

	deletedAt?: Date; // Soft delete
}
