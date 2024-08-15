import { ObjectType, Field, ID } from '@nestjs/graphql';
import { FaqCategory, FaqStatus } from '../../enums/faq.enum';
import { TotalCounter } from '../../types/common';
import { Member } from '../member/member';
import { ObjectId } from 'mongoose';

@ObjectType()
export class Faq {
	@Field(() => String)
	_id: ObjectId;

	@Field(() => FaqCategory)
	faqCategory: FaqCategory;

	@Field(() => FaqStatus)
	faqStatus: FaqStatus;

	@Field(() => String)
	faqTitle: string;

	@Field(() => String)
	faqContent: string;

	@Field(() => String)
	memberId: string;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;

	@Field(() => Member, { nullable: true })
	memberData?: Member; // Eagerly load member data
}

@ObjectType()
export class Faqs {
	@Field(() => [Faq])
	list: Faq[];

	@Field(() => [TotalCounter], { nullable: true })
	metaCounter: TotalCounter[];
}
