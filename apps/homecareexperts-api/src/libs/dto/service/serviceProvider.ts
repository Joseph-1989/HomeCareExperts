import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';

@ObjectType()
export class ServiceProvider {
	@Field(() => String)
	_id: ObjectId;

	@Field(() => String)
	firstName: string;

	@Field(() => String)
	lastName: string;

	@Field(() => String, { nullable: true })
	companyName?: string; // Optional for individual providers

	@Field(() => String)
	email: string;

	@Field(() => String)
	phoneNumber: string;

	@Field(() => String, { nullable: true })
	profilePicture?: string;

	@Field(() => [String])
	serviceCategories: string[]; // Array of service categories offered

	@Field(() => [String], { nullable: true })
	certifications?: string[]; // Optional: list of certifications

	@Field(() => String, { nullable: true })
	bio?: string;

	@Field(() => Number)
	averageRating: number; // Average of customer reviews

	@Field(() => Int)
	totalReviews: number;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;
}
