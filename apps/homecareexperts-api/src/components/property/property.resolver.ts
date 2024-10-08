import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { Properties, Property } from '../../libs/dto/property/property';
import { PropertyService } from './property.service';
import { PropertyUpdate } from '../../libs/dto/property/property.update';
import { WithoutGuard } from '../auth/guards/without.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MemberType } from '../../libs/enums/member.enum';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ObjectId } from 'mongoose';
import { Roles } from '../auth/decorators/roles.decorator';
import {
	AgentPropertiesInquiry,
	AllPropertiesInquiry,
	PropertiesInquiry,
	PropertyInput,
	OrdinaryInquiry,
} from '../../libs/dto/property/property.input';

@Resolver()
export class PropertyResolver {
	constructor(private readonly propertyService: PropertyService) {}

	// Mutation => createProperty ================================================================

	@Roles(MemberType.AGENT)
	@UseGuards(RolesGuard)
	@Mutation(() => Property)
	public async createProperty(
		@Args('input') input: PropertyInput,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Property> {
		console.log('property.resolver.ts => @Mutation => createProperty');
		input.memberId = memberId;
		return await this.propertyService.createProperty(input);
	}

	// Query => getProperty ================================================================

	@UseGuards(WithoutGuard)
	@Query((returns) => Property)
	public async getProperty(
		@Args('propertyId') input: string,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Property> {
		console.log('Query: getProperty');
		const propertyId = shapeIntoMongoObjectId(input);

		return await this.propertyService.getProperty(memberId, propertyId);
	}

	// MUTATION => updateProperty ================================================================

	@Roles(MemberType.AGENT)
	@UseGuards(RolesGuard)
	@Mutation((returns) => Property)
	public async updateProperty(
		@Args('input') input: PropertyUpdate,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Property> {
		console.log('Mutation: updateProperty');
		input._id = shapeIntoMongoObjectId(input._id);
		return await this.propertyService.updateProperty(memberId, input);
	}

	// Query => getProperties ================================================================

	@UseGuards(WithoutGuard)
	@Query((returns) => Properties)
	public async getProperties(
		@Args('input') input: PropertiesInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Properties> {
		console.log('Query: getProperties');
		return await this.propertyService.getProperties(memberId, input);
	}

	// Query => getFavorites ================================================================

	@UseGuards(AuthGuard)
	@Query((returns) => Properties)
	public async getFavorites(
		@Args('input') input: OrdinaryInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Properties> {
		console.log('Query: getFavorites');
		return await this.propertyService.getFavorites(memberId, input);
	}

	// Query => getVisited ================================================================

	@UseGuards(AuthGuard)
	@Query((returns) => Properties)
	public async getVisited(
		@Args('input') input: OrdinaryInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Properties> {
		console.log('Query: getVisited');
		return await this.propertyService.getVisited(memberId, input);
	}

	// Query => getAgentProperties ================================================================

	@Roles(MemberType.AGENT)
	@UseGuards(RolesGuard)
	@Query(() => Properties)
	public async getAgentProperties(
		@Args('input') input: AgentPropertiesInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Properties> {
		console.log('Query: getAgentProperties');
		return await this.propertyService.getAgentProperties(memberId, input);
	}

	// MUTATION => likeTargetProperty ================================================================

	@UseGuards(AuthGuard)
	@Mutation(() => Property)
	public async likeTargetProperty(
		@Args('propertyId') input: string,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Property> {
		console.log('Mutation: likeTargetProperty');
		const likeRefId = shapeIntoMongoObjectId(input); // Make sure function name is correctly cased
		return await this.propertyService.likeTargetProperty(memberId, likeRefId);
	}

	// Query => getAllPropertiesByAdmin ================================================================

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Query((returns) => Properties)
	public async getAllPropertiesByAdmin(
		@Args('input') input: AllPropertiesInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Properties> {
		console.log('Query: getAllPropertiesByAdmin');
		return await this.propertyService.getAllPropertiesByAdmin(input);
	}

	// MUTATION => updatePropertyByAdmin ================================================================

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => Property)
	public async updatePropertyByAdmin(@Args('input') input: PropertyUpdate): Promise<Property> {
		console.log('Mutation: updatePropertyByAdmin');
		input._id = shapeIntoMongoObjectId(input._id);
		return await this.propertyService.updatePropertyByAdmin(input);
	}

	// MUTATION => removePropertyByAdmin ================================================================

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => Property)
	public async removePropertyByAdmin(@Args('propertyId') input: string): Promise<Property> {
		console.log('Mutation: removePropertyByAdmin');
		const propertyId = shapeIntoMongoObjectId(input);
		return await this.propertyService.removePropertyByAdmin(propertyId);
	}
}
