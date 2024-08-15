import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';
import { ObjectId } from 'mongoose';
import { LikeGroup } from '../../enums/like.enum';

@InputType()
export class LikeInput {
	@IsNotEmpty()
	@Field(() => String)
	memberId: ObjectId; //kim likeni amalga oshiryapti

	@IsNotEmpty()
	@Field(() => String)
	likeRefId: ObjectId; //like qilinadigan objectning idsi

	@IsNotEmpty()
	@Field(() => LikeGroup)
	likeGroup: LikeGroup; //like qilinadigan objectning gruppasi
}
