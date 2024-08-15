import { registerEnumType } from '@nestjs/graphql';

export enum BoardArticleCategory {
	GENERAL_DISCUSSION = 'GENERAL_DISCUSSION',
	ANNOUNCEMENTS = 'ANNOUNCEMENTS',
	HELP_AND_SUPPORT = 'HELP_AND_SUPPORT',
	TIPS_AND_TRICKS = 'TIPS_AND_TRICKS',
	REVIEWS = 'REVIEWS',
	MARKETPLACE = 'MARKETPLACE',
	EVENTS = 'EVENTS',
	PROJECTS = 'PROJECTS',
	INTRODUCTIONS = 'INTRODUCTIONS',
	FEEDBACK = 'FEEDBACK',
	OFF_TOPIC = 'OFF_TOPIC',
	TECH_TALK = 'TECH_TALK',
	CREATIVE_CORNER = 'CREATIVE_CORNER',
	CAREER_ADVICE = 'CAREER_ADVICE',
	INDUSTRY_NEWS = 'INDUSTRY_NEWS',
}
registerEnumType(BoardArticleCategory, {
	name: 'BoardArticleCategory',
});

export enum BoardArticleStatus {
	ACTIVE = 'ACTIVE',
	DELETE = 'DELETE',
}
registerEnumType(BoardArticleStatus, {
	name: 'BoardArticleStatus',
});
