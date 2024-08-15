import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { NoticeInput, NoticeInquiry } from '../../libs/dto/notice/notice.input';
import { Notice } from '../../libs/dto/notice/notice';
import { Direction, Message } from '../../libs/enums/common.enum';
import { NoticeUpdate } from '../../libs/dto/notice/notice.update';

@Injectable()
export class NoticeService {
	constructor(@InjectModel(Notice.name) private noticeModel: Model<Notice>) {}

	async findAll(inquiry: NoticeInquiry): Promise<{ list: Notice[]; metaCounter: { total: number }[] }> {
		const { page, limit, sort, direction, search } = inquiry;
		const sortOrder = direction === Direction.ASC ? 1 : -1;

		// Constructing the match query
		const match: any = {};
		if (search.noticeCategory) match.noticeCategory = search.noticeCategory;
		if (search.noticeStatus) match.noticeStatus = search.noticeStatus;
		if (search.noticeTitle) match.noticeTitle = { $regex: search.noticeTitle, $options: 'i' };
		if (search.noticeContent) match.noticeContent = { $regex: search.noticeContent, $options: 'i' };
		if (search.memberId) match.memberId = search.memberId;

		// Aggregation pipeline
		const result = await this.noticeModel
			.aggregate([
				{ $match: match },
				{ $sort: { [sort]: sortOrder } },
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

		// Returning the Notices with metaCounter
		return result[0];
	}

	async findOne(id: string): Promise<Notice> {
		const notice = await this.noticeModel.findById(id).exec();
		if (!notice) {
			throw new NotFoundException(`Notice with ID ${id} not found`);
		}
		return notice;
	}

	async create(input: NoticeInput): Promise<Notice> {
		const newNotice = new this.noticeModel(input);
		return newNotice.save();
	}

	async update(noticeId: string, memberId: string, input: NoticeUpdate): Promise<Notice> {
		const notice = await this.noticeModel
			.findOneAndUpdate(
				{ _id: noticeId, memberId }, // Ensure the memberId matches
				input,
				{ new: true },
			)
			.exec();

		if (!notice) {
			throw new NotFoundException(`Notice with ID ${noticeId} not found`);
		}

		return notice;
	}

	async remove(id: string): Promise<Notice> {
		const notice = await this.noticeModel.findByIdAndDelete(id).exec();
		if (!notice) {
			throw new NotFoundException(`Notice with ID ${id} not found`);
		}
		return notice;
	}
}
