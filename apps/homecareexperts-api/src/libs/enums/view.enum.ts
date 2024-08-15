import { registerEnumType } from '@nestjs/graphql';

export enum ViewGroup {
	MEMBER = 'MEMBER',
	ARTICLE = 'ARTICLE',
	PROPERTY = 'PROPERTY',
	SERVICE = 'SERVICE',
}

registerEnumType(ViewGroup, {
	name: 'ViewGroup',
});
