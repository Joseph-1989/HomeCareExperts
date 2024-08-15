import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, ObjectId } from 'mongoose';
import { Faq, Faqs } from '../../libs/dto/faq/faq';
import { FaqInput, FaqInquiry } from '../../libs/dto/faq/faq.input';
import { FaqUpdate } from '../../libs/dto/faq/faq.update';
import { Direction, Message } from '../../libs/enums/common.enum';

@Injectable()
export class FaqService {
	constructor(@InjectModel(Faq.name) private readonly faqModel: Model<Faq>) {}

	async findByCategory(category: string): Promise<Faq[]> {
		return this.faqModel.find({ faqCategory: category }).exec();
	}

	async getFaqsByStatus(status: string): Promise<Faq[]> {
		return this.faqModel.find({ faqStatus: status }).exec();
	}

	public async getAllFaqs(faqInquiry: FaqInquiry): Promise<Faqs> {
		const { page, limit, sort, direction, search } = faqInquiry;

		// Constructing the match query
		const match: any = {};
		if (search.memberId) match.memberId = search.memberId;
		if (search.faqCategory) match.faqCategory = search.faqCategory;
		if (search.faqStatus) match.faqStatus = search.faqStatus;
		if (search.faqTitle) match.faqTitle = { $regex: search.faqTitle, $options: 'i' };
		if (search.faqContent) match.faqContent = { $regex: search.faqContent, $options: 'i' };

		// Sorting options
		const sortOptions: any = { [sort ?? 'createdAt']: direction === Direction.ASC ? 1 : -1 };

		// Aggregation pipeline
		const result = await this.faqModel
			.aggregate([
				{ $match: match },
				{ $sort: sortOptions },
				{
					$facet: {
						list: [
							{ $skip: (page - 1) * limit },
							{ $limit: limit },
							{
								$lookup: {
									from: 'members', // Assuming 'members' is the name of the collection for member data
									localField: 'memberId',
									foreignField: '_id',
									as: 'memberData',
								},
							},
							{ $unwind: { path: '$memberData', preserveNullAndEmptyArrays: true } },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		// Check if results exist
		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		// Returning the FAQs with metaCounter
		return result[0];
	}

	async create(input: FaqInput): Promise<Faq> {
		const newFaq = new this.faqModel(input);
		return newFaq.save();
	}

	async update(input: FaqUpdate): Promise<Faq> {
		const { _id, ...updateData } = input; // Extract _id and the rest of the data
		const existingFaq = await this.faqModel.findByIdAndUpdate(_id, updateData, { new: true }).exec();
		if (!existingFaq) {
			throw new NotFoundException(`FAQ with ID ${_id} not found`);
		}
		return existingFaq;
	}

	async delete(id: mongoose.Types.ObjectId): Promise<Faq> {
		const faq = await this.faqModel.findByIdAndDelete(id).exec();
		if (!faq) {
			throw new NotFoundException(`FAQ with ID ${id} not found`);
		}
		return faq;
	}
}
