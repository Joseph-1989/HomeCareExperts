import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { View } from '../../libs/dto/view/view';
import { Model, ObjectId } from 'mongoose';
import { ViewInput } from '../../libs/dto/view/view.input';
import { T } from '../../libs/types/common';
import { Properties } from '../../libs/dto/property/property';
import { ViewGroup } from '../../libs/enums/view.enum';
import { lookupVisit, lookupVisited } from '../../libs/config';
import { Services } from '../../libs/dto/service/service';
import { OrdinaryInquiry } from '../../libs/dto/property/property.input';
import { ServiceOrdinaryInquiry } from '../../libs/dto/service/service.input';

@Injectable()
export class ViewService {
	constructor(@InjectModel('View') private readonly viewModel: Model<View>) {}

	// MUTATION => recordView ================================================================
	public async recordView(input: ViewInput): Promise<View | null> {
		const viewExist = await this.checkViewExistence(input);
		if (!viewExist) {
			console.log('NEW VIEW WAS INSERTED');

			return await this.viewModel.create(input);
		} else return null;
	}

	private async checkViewExistence(input: ViewInput): Promise<View> {
		const { memberId, viewRefId } = input;
		const search: T = { memberId: memberId, viewRefId: viewRefId };
		return await this.viewModel.findOne(search).exec();
	}

	// QUERY => getVisitedProperties ================================================================
	public async getVisitedProperties(memberId: ObjectId, input: OrdinaryInquiry): Promise<Properties> {
		const { page, limit } = input;
		const match: T = { viewGroup: ViewGroup.PROPERTY, memberId: memberId };

		const data: T = await this.viewModel
			.aggregate([
				{ $match: match },
				{ $sort: { updatedAt: -1 } },
				{
					$lookup: {
						from: 'properties',
						localField: 'viewRefId',
						foreignField: '_id',
						as: 'visitedProperty',
					},
				},
				{ $unwind: '$visitedProperty' },
				{
					$facet: {
						list: [
							{ $skip: (page - 1) * limit },
							{ $limit: limit },
							lookupVisit,
							{ $unwind: '$visitedProperty.memberData' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		const result: Properties = { list: [], metaCounter: data[0].metaCounter };
		result.list = data[0].list.map((ele) => ele.visitedProperty);

		return result;
	}

	// QUERY => getVisitedServices ================================================================

	public async getVisitedServices(memberId: ObjectId, input: ServiceOrdinaryInquiry): Promise<Services> {
		const { page, limit } = input;
		const match: T = { viewGroup: ViewGroup.SERVICE, memberId: memberId };

		const data: T = await this.viewModel
			.aggregate([
				{ $match: match },
				{ $sort: { updatedAt: -1 } },
				{
					$lookup: {
						from: 'services',
						localField: 'viewRefId',
						foreignField: '_id',
						as: 'visitedService',
					},
				},
				{ $unwind: '$visitedService' },
				{
					$facet: {
						list: [
							{ $skip: (page - 1) * limit },
							{ $limit: limit },
							lookupVisited,
							{ $unwind: '$visitedService.memberData' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		const result: Services = { list: [], metaCounter: data[0].metaCounter };
		result.list = data[0].list.map((ele) => ele.visitedService);

		return result;
	}
}
