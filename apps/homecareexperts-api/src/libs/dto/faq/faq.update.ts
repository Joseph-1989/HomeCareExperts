import { InputType, Field } from '@nestjs/graphql';
import { FaqCategory, FaqStatus } from '../../enums/faq.enum';

@InputType()
export class FaqUpdate {
	@Field(() => String)
	_id: string; // Assuming ID is required for updates

	@Field(() => FaqCategory, { nullable: true })
	faqCategory?: FaqCategory;

	@Field(() => FaqStatus, { nullable: true })
	faqStatus?: FaqStatus;

	@Field(() => String, { nullable: true })
	faqTitle?: string;

	@Field(() => String, { nullable: true })
	faqContent?: string;

	@Field(() => String, { nullable: true })
	memberId?: string;
}
