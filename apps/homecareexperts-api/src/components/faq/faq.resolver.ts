import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { Faq, Faqs } from '../../libs/dto/faq/faq';
import { FaqInput, FaqInquiry } from '../../libs/dto/faq/faq.input';
import { FaqUpdate } from '../../libs/dto/faq/faq.update';
import { FaqService } from './faq.service';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import mongoose, { ObjectId } from 'mongoose';
import { FaqCategory, FaqStatus } from '../../libs/enums/faq.enum';

@Resolver(() => Faq)
export class FaqResolver {
	constructor(private readonly faqService: FaqService) {}

	@Query(() => [Faq])
	async getFaqsByCategory(@Args('category', { type: () => String }) category: string) {
		return this.faqService.findByCategory(category);
	}

	@Query(() => [Faq])
	async getFaqsByStatus(@Args('status') status: string): Promise<Faq[]> {
		return this.faqService.getFaqsByStatus(status);
	}

	@Query(() => Faqs)
	async getAllFaqs(@Args('input') faqInquiry: FaqInquiry): Promise<Faqs> {
		if (faqInquiry.search.memberId) {
			faqInquiry.search.memberId = shapeIntoMongoObjectId(faqInquiry.search.memberId);
		}
		return await this.faqService.getAllFaqs(faqInquiry);
	}

	@Mutation(() => Faq)
	async createFaq(@Args('input') input: FaqInput) {
		if (!mongoose.Types.ObjectId.isValid(input.memberId)) {
			throw new Error('Invalid memberId');
		}

		if (!input.faqTitle) throw new Error('faqTitle is required');
		if (!input.faqContent) throw new Error('faqContent is required');
		if (!input.memberId) throw new Error('memberId is required');
		if (!input.faqStatus) throw new Error('faqStatus is required');
		if (!input.faqCategory) throw new Error('faqCategory is required');

		input.memberId = shapeIntoMongoObjectId(input.memberId);

		if (!input.faqStatus) input.faqStatus = FaqStatus.ACTIVE;
		if (!input.faqCategory) input.faqCategory = FaqCategory.OTHER;

		return this.faqService.create(input);
	}

	@Mutation(() => Faq)
	async updateFaq(@Args('input') input: FaqUpdate) {
		return this.faqService.update(input);
	}

	@Mutation(() => Faq)
	async deleteFaq(@Args('id') id: string) {
		if (!mongoose.Types.ObjectId.isValid(id)) {
			throw new Error('Invalid ObjectId');
		}

		// Convert string to ObjectId
		const objectId = new mongoose.Types.ObjectId(id);

		// Call the service to delete the Faq
		const deletedFaq = await this.faqService.delete(objectId);
		if (!deletedFaq) {
			throw new Error('Failed to delete FAQ');
		}
		return deletedFaq;
	}
}
