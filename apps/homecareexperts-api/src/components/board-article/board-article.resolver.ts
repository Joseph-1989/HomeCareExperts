import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { BoardArticle, BoardArticles } from '../../libs/dto/board-article/board-article';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { BoardArticleService } from './board-article.service';
import { BoardArticleUpdate } from '../../libs/dto/board-article/board-article.update';
import { WithoutGuard } from '../auth/guards/without.guard';
import { MemberType } from '../../libs/enums/member.enum';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ObjectId } from 'mongoose';
import { Roles } from '../auth/decorators/roles.decorator';
import {
	AllBoardArticlesInquiry,
	BoardArticleInput,
	BoardArticlesInquiry,
} from '../../libs/dto/board-article/board-article.input';

@Resolver()
export class BoardArticleResolver {
	constructor(private readonly boardArticleService: BoardArticleService) {}

	/** createBoardArticle ============================================================================== **/

	@UseGuards(AuthGuard)
	@Mutation(() => BoardArticle)
	public async createBoardArticle(
		@Args('input') input: BoardArticleInput,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<BoardArticle> {
		console.log('Mutation: createBoardArticle');
		return await this.boardArticleService.createBoardArticle(memberId, input);
	}

	/** getBoardArticle ============================================================================== **/

	@UseGuards(WithoutGuard)
	@Query((returns) => BoardArticle)
	public async getBoardArticle(
		@Args('articleId') input: string,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<BoardArticle> {
		console.log('Query: getBoardArticle');
		const articleId = shapeIntoMongoObjectId(input);
		return await this.boardArticleService.getBoardArticle(memberId, articleId);
	}

	/** updateBoardArticle ============================================================================== **/

	@UseGuards(AuthGuard)
	@Mutation(() => BoardArticle)
	public async updateBoardArticle(
		@Args('input') input: BoardArticleUpdate,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<BoardArticle> {
		console.log('Mutation: updateBoardArticle');
		input._id = shapeIntoMongoObjectId(input._id);
		return await this.boardArticleService.updateBoardArticle(memberId, input);
	}

	/** getBoardArticles ============================================================================== **/

	@UseGuards(WithoutGuard)
	@Query(() => BoardArticles)
	public async getBoardArticles(
		@Args('input') input: BoardArticlesInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<BoardArticles> {
		console.log('Query: getBoardArticles');
		return await this.boardArticleService.getBoardArticles(memberId, input);
	}

	// MUTATION => likeTargetBoardArticle ================================================================

	@UseGuards(AuthGuard)
	@Mutation(() => BoardArticle)
	public async likeTargetBoardArticle(
		@Args('articleId') input: string,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<BoardArticle> {
		console.log('Mutation: likeTargetBoardArticle');
		const likeRefId = shapeIntoMongoObjectId(input); // Make sure function name is correctly cased
		return await this.boardArticleService.likeTargetBoardArticle(memberId, likeRefId);
	}

	/** ADMIN ============================================================================== **/

	/** getAllBoardArticlesByAdmin ============================================================================== **/

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Query(() => BoardArticles)
	public async getAllBoardArticlesByAdmin(
		@Args('input') input: AllBoardArticlesInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<BoardArticles> {
		console.log('Query: getAllBoardArticlesByAdmin');
		return await this.boardArticleService.getAllBoardArticlesByAdmin(input);
	}

	/** updateBoardArticleByAdmin ============================================================================== **/

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => BoardArticle)
	public async updateBoardArticleByAdmin(
		@Args('input') input: BoardArticleUpdate,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<BoardArticle> {
		console.log('Mutation: updateBoardArticleByAdmin');
		input._id = shapeIntoMongoObjectId(input._id);
		return await this.boardArticleService.updateBoardArticleByAdmin(input);
	}

	/** removeBoardArticleByAdmin ============================================================================== **/

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation((returns) => BoardArticle)
	public async removeBoardArticleByAdmin(
		@Args('articleId') input: string,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<BoardArticle> {
		console.log('Mutation: removeBoardArticleByAdmin');
		const articleId = shapeIntoMongoObjectId(input);
		return await this.boardArticleService.removeBoardArticleByAdmin(articleId);
	}
}
