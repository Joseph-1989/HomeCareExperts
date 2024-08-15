import { registerEnumType } from '@nestjs/graphql';

export enum LikeGroup {
	MEMBER = 'MEMBER',
	PROPERTY = 'PROPERTY',
	ARTICLE = 'ARTICLE',
	SERVICE = 'SERVICE',
}
registerEnumType(LikeGroup, {
	name: 'LikeGroup',
});
