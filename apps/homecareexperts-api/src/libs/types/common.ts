import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';

export interface T {
	[key: string]: any;
}

export interface StatisticModifier {
	_id: ObjectId;
	targetKey: string;
	modifier: number;
}

@ObjectType()
export class TotalCounter {
	@Field(() => Int, { nullable: true })
	total: number;
}
