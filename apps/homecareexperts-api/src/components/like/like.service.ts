import { BadRequestException, Injectable } from '@nestjs/common';
import { lookupFavorite, lookupFavorited } from '../../libs/config';
import { ServiceOrdinaryInquiry } from '../../libs/dto/service/service.input';
import { Model, ObjectId } from 'mongoose';
import { OrdinaryInquiry } from '../../libs/dto/property/property.input';
import { Like, MeLiked } from '../../libs/dto/like/like';
import { InjectModel } from '@nestjs/mongoose';
import { Properties } from '../../libs/dto/property/property';
import { LikeInput } from '../../libs/dto/like/like.input';
import { LikeGroup } from '../../libs/enums/like.enum';
import { Services } from '../../libs/dto/service/service';
import { Message } from '../../libs/enums/common.enum';

@Injectable()
export class LikeService {
	constructor(@InjectModel('Like') private readonly likeModel: Model<Like>) {}

	//toggleLike================================================================

	public async toggleLike(input: LikeInput): Promise<number> {
		const search = { memberId: input.memberId, likeRefId: input.likeRefId };
		const exist = await this.likeModel.findOne(search).exec();
		let modifier = 1;

		if (exist) {
			await this.likeModel.findOneAndDelete(search).exec();
			modifier = -1;
		} else {
			try {
				await this.likeModel.create(input);
			} catch (err) {
				console.log('Error, Service model:', err.message);
				throw new BadRequestException(Message.CREATE_FAILED);
			}
		}

		console.log(`- Like modifier ${modifier} -`);
		return modifier;
	}

	//checkLikeExistence================================================================
	public async checkLikeExistence(input: LikeInput): Promise<MeLiked[]> {
		const { memberId, likeRefId } = input;
		const result = await this.likeModel.findOne({ memberId: memberId, likeRefId: likeRefId }).exec();
		return result ? [{ memberId: memberId, likeRefId: likeRefId, myFavorite: true }] : [];
	}

	//getFavoriteProperties ================================================================
	public async getFavoriteProperties(memberId: ObjectId, input: OrdinaryInquiry): Promise<Properties> {
		const { page, limit } = input;
		const match: any = { likeGroup: LikeGroup.PROPERTY, memberId: memberId };

		const data: any = await this.likeModel
			.aggregate([
				{ $match: match },
				{ $sort: { updatedAt: -1 } },
				{
					$lookup: {
						from: 'properties',
						localField: 'likeRefId',
						foreignField: '_id',
						as: 'favoriteProperty',
					},
				},
				{ $unwind: '$favoriteProperty' },
				{
					$facet: {
						list: [
							{ $skip: (page - 1) * limit },
							{ $limit: limit },
							lookupFavorite,
							{ $unwind: '$favoriteProperty.memberData' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		const result: Properties = { list: [], metaCounter: data[0].metaCounter };
		result.list = data[0].list.map((ele) => ele.favoriteProperty);

		console.log('result:', result);
		return result;
	}

	//getFavoriteServices ================================================================
	public async getFavoriteServices(memberId: ObjectId, input: ServiceOrdinaryInquiry): Promise<Services> {
		const { page, limit } = input;
		const match: any = { likeGroup: LikeGroup.SERVICE, memberId: memberId };

		const data: any = await this.likeModel
			.aggregate([
				{ $match: match },
				{ $sort: { updatedAt: -1 } },
				{
					$lookup: {
						from: 'services',
						localField: 'likeRefId',
						foreignField: '_id',
						as: 'favoriteService',
					},
				},
				{ $unwind: '$favoriteService' },
				{
					$facet: {
						list: [
							{ $skip: (page - 1) * limit },
							{ $limit: limit },
							lookupFavorited,
							{ $unwind: '$favoriteService.memberData' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		const result: Services = { list: [], metaCounter: data[0].metaCounter };
		result.list = data[0].list.map((ele) => ele.favoriteService);

		console.log('result:', result);
		return result;
	}
}
