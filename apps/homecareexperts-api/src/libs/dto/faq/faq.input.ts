import { InputType, Field, Int, ID } from '@nestjs/graphql';
import { FaqCategory, FaqStatus } from '../../enums/faq.enum';
import { IsIn, IsNotEmpty, IsOptional, Min } from 'class-validator';
import { ObjectId } from 'mongoose';
import { NoticeCategory } from '../../enums/notice.enum';
import { availableFaqSorts, availableNoticeSorts } from '../../config';
import { Direction } from '../../enums/common.enum';

@InputType()
export class FaqInput {
	@Field(() => FaqCategory)
	faqCategory: FaqCategory;

	@Field(() => FaqStatus, { nullable: true })
	faqStatus?: FaqStatus;

	@Field(() => String)
	faqTitle: string;

	@Field(() => String)
	faqContent: string;

	@Field(() => ID)
	memberId: string; // Assuming memberId is of type string
}

@InputType()
class FaqInquirySearch {
	@IsOptional()
	@Field(() => String, { nullable: true })
	memberId?: string;

	@IsOptional()
	@Field(() => FaqCategory, { nullable: true })
	faqCategory?: FaqCategory;

	@IsOptional()
	@Field(() => FaqStatus, { nullable: true })
	faqStatus?: FaqStatus;

	@IsOptional()
	@Field(() => String, { nullable: true })
	faqTitle?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	faqContent?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	text?: string;
}

@InputType()
export class FaqInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@IsIn(availableFaqSorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@Field(() => FaqInquirySearch)
	search: FaqInquirySearch;
}
