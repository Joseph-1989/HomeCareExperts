import { ObjectId } from 'bson';

export const availableAgentsSorts = ['createdAt', 'updatedAt', 'memberLikes', 'memberViews', 'memberRank'];
export const availableMembersSorts = ['createdAt', 'updatedAt', 'memberLikes', 'memberViews'];

export const availableNotificationsSorts = [
	'createdAt',
	'updatedAt',
	'notificationType',
	'notificationStatus',
	'notificationGroup',
];

export const availableNoticeSorts = ['createdAt', 'updatedAt', 'noticeCategory', 'noticeStatus', 'noticeTitle'];

export const availableFaqSorts = ['createdAt', 'updatedAt', 'faqCategory', 'faqStatus', 'faqTitle'];

export const availableOptions = ['propertyBarter', 'propertyRent'];
export const availablePropertySorts = [
	'createdAt',
	'updatedAt',
	'propertyLikes',
	'propertyViews',
	'propertyRank',
	'propertyPrice',
];

export const availableServiceOptions = [
	'assistanceDIY',
	'subscriptionModel',
	'emergencyServices',
	'referralPrograms',
	// ... add more options as needed
];

export const availableServiceSorts = [
	'createdAt',
	'updatedAt',
	'serviceLikes',
	'serviceViews',
	'serviceRank',
	'servicePrice',
];

export const availableBoardArticlesSorts = [
	'createdAt',
	'updatedAt',
	'articleLikes',
	'articleViews',
	'articleCategory',
	'articleStatus',
];

export const availableCommentSorts = ['createdAt', 'updatedAt'];

// IMAGE CONFIGURATION (config.js)
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { T } from './types/common';

export const validMimeTypes = ['image/png', 'image/jpg', 'image/jpeg'];
export const getSerialForImage = (filename: string) => {
	const ext = path.parse(filename).ext;
	return uuidv4() + ext;
};

export const shapeIntoMongoObjectId = (target: any) => {
	return typeof target === 'string' ? new ObjectId(target) : target;
};

export const lookupAuthMemberLiked = (memberId: T, targetRefId: string = '$_id') => {
	return {
		$lookup: {
			from: 'likes',
			let: {
				localLikeRefId: targetRefId,
				localMemberId: memberId,
				localMyFavorite: true,
			},
			pipeline: [
				{
					$match: {
						$expr: {
							$and: [{ $eq: ['$likeRefId', '$$localLikeRefId'] }, { $eq: ['$memberId', '$$localMemberId'] }],
						},
					},
				},
				{
					$project: {
						_id: 0,
						memberId: 1,
						likeRefId: 1,
						myFavorite: '$$localMyFavorite',
					},
				},
			],
			as: 'meLiked',
		},
	};
};

interface LookupAuthMemberFollowed {
	followerId: T;
	followingId: string;
}

export const lookupAuthMemberFollowed = (input: LookupAuthMemberFollowed) => {
	const { followerId, followingId } = input;
	return {
		$lookup: {
			from: 'follows',
			let: {
				localFollowerId: followerId,
				localFollowingId: followingId,
				localMyFavorite: true,
			},
			pipeline: [
				{
					$match: {
						$expr: {
							$and: [{ $eq: ['$followerId', '$$localFollowerId'] }, { $eq: ['$followingId', '$$localFollowingId'] }],
						},
					},
				},
				{
					$project: {
						_id: 0,
						followerId: 1,
						followingId: 1,
						myFollowing: '$$localMyFavorite',
					},
				},
			],
			as: 'meFollowed',
		},
	};
};

export const lookupMember = {
	$lookup: {
		from: 'members',
		localField: 'memberId',
		foreignField: '_id',
		as: 'memberData',
	},
};

export const lookupFollowingData = {
	$lookup: {
		from: 'members',
		localField: 'followingId',
		foreignField: '_id',
		as: 'followingData',
	},
};

export const lookupFollowerData = {
	$lookup: {
		from: 'members',
		localField: 'followerId',
		foreignField: '_id',
		as: 'followerData',
	},
};

export const lookupFavorite = {
	$lookup: {
		from: 'members',
		localField: 'favoriteProperty.memberId',
		foreignField: '_id',
		as: 'favoriteProperty.memberData',
	},
};

export const lookupFavorited = {
	$lookup: {
		from: 'members',
		localField: 'favoriteService.memberId',
		foreignField: '_id',
		as: 'favoriteService.memberData',
	},
};

export const lookupVisit = {
	$lookup: {
		from: 'members',
		localField: 'visitedProperty.memberId',
		foreignField: '_id',
		as: 'visitedProperty.memberData',
	},
};

export const lookupVisited = {
	$lookup: {
		from: 'members',
		localField: 'visitedService.memberId',
		foreignField: '_id',
		as: 'visitedService.memberData',
	},
};

export const lookupFavoriteService = {
	$lookup: {
		from: 'serviceProviders',
		localField: 'favoriteService.serviceProviderId', // Assuming service provider IDs
		foreignField: '_id',
		as: 'favoriteService.serviceProviderData', // Embedded data
	},
};

export const lookupBookedService = {
	$lookup: {
		from: 'serviceProviders',
		localField: 'bookedService.serviceProviderId',
		foreignField: '_id',
		as: 'bookedService.serviceProviderData',
	},
};
