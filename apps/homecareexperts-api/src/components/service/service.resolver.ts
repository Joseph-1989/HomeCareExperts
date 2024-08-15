import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { ServiceUpdateInput } from '../../libs/dto/service/service.update';
import { Service, Services } from '../../libs/dto/service/service';
import { ServiceService } from './service.service';
import { WithoutGuard } from '../auth/guards/without.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { AuthGuard } from '../auth/guards/auth.guard';
import { UseGuards } from '@nestjs/common';
import { ObjectId } from 'mongoose';
import { Roles } from '../auth/decorators/roles.decorator';
import {
	AgentServicesInquiry,
	AllServicesInquiry,
	ServiceOrdinaryInquiry,
	ServiceInput,
	ServicesInquiry,
} from '../../libs/dto/service/service.input';

@Resolver()
export class ServiceResolver {
	constructor(private readonly serviceService: ServiceService) {}

	// Mutation => createService ================================================================

	@Roles(MemberType.AGENT)
	@UseGuards(RolesGuard)
	@Mutation(() => Service)
	public async createService(
		@Args('input') input: ServiceInput,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Service> {
		console.log('service.resolver.ts => @Mutation => createService', input.memberId);
		console.log('input', input);
		input.memberId = memberId;

		return await this.serviceService.createService(input);
	}

	// Query => getService ================================================================

	@UseGuards(WithoutGuard)
	@Query((returns) => Service)
	public async getService(@Args('serviceId') input: string, @AuthMember('_id') memberId: ObjectId): Promise<Service> {
		console.log('Query: getService');
		const serviceId = shapeIntoMongoObjectId(input);
		return await this.serviceService.getService(memberId, serviceId);
	}

	// MUTATION => updateService ================================================================

	@Roles(MemberType.AGENT)
	@UseGuards(RolesGuard)
	@Mutation((returns) => Service)
	public async updateService(
		@Args('input') input: ServiceUpdateInput,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Service> {
		console.log('Mutation: updateService');
		input._id = shapeIntoMongoObjectId(input._id);
		return await this.serviceService.updateService(memberId, input);
	}

	// Query => getServices ================================================================

	@UseGuards(WithoutGuard)
	@Query((returns) => Services)
	public async getServices(
		@Args('input') input: ServicesInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Services> {
		console.log('Query: getServices', input);
		return await this.serviceService.getServices(memberId, input);
	}

	// Query => getMemberServices ================================================================

	@Query(() => Services)
	public async getMemberServices(
		@Args('input') input: ServicesInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Services> {
		// Ensure the search is scoped to the authenticated member
		input.search.memberId = memberId;

		return await this.serviceService.getMemberServices(input);
	}

	// Query => getFavorites ================================================================

	@UseGuards(AuthGuard)
	@Query((returns) => Services)
	public async getFavorites_Service(
		@Args('input') input: ServiceOrdinaryInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Services> {
		console.log('Query: getFavorites');
		return await this.serviceService.getFavorites_Service(memberId, input);
	}

	// Query => getVisited ================================================================

	@UseGuards(AuthGuard)
	@Query((returns) => Services)
	public async getVisited_Service(
		@Args('input') input: ServiceOrdinaryInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Services> {
		console.log('Query: getVisited');
		return await this.serviceService.getVisited_Service(memberId, input);
	}

	// Query => getAgentServices ================================================================

	@Roles(MemberType.AGENT)
	@UseGuards(RolesGuard)
	@Query(() => Services)
	public async getAgentServices(
		@Args('input') input: AgentServicesInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Services> {
		console.log('Query: getAgentServices');
		return await this.serviceService.getAgentServices(memberId, input);
	}

	// MUTATION => likeTargetService ================================================================

	@UseGuards(AuthGuard)
	@Mutation(() => Service)
	public async likeTargetService(
		@Args('serviceId') input: string,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Service> {
		console.log('Mutation: likeTargetService');
		const likeRefId = shapeIntoMongoObjectId(input); // Make sure function name is correctly cased
		return await this.serviceService.likeTargetService(memberId, likeRefId);
	}

	// Query => getAllServicesByAdmin ================================================================

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Query((returns) => Services)
	public async getAllServicesByAdmin(
		@Args('input') input: AllServicesInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Services> {
		console.log('Query: getAllServicesByAdmin');
		return await this.serviceService.getAllServicesByAdmin(input);
	}

	// MUTATION => updateServiceByAdmin ================================================================

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => Service)
	public async updateServiceByAdmin(@Args('input') input: ServiceUpdateInput): Promise<Service> {
		console.log('Mutation: updateServiceByAdmin');
		input._id = shapeIntoMongoObjectId(input._id);
		return await this.serviceService.updateServiceByAdmin(input);
	}

	// MUTATION => removeServiceByAdmin ================================================================

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => Service)
	public async removeServiceByAdmin(@Args('serviceId') input: string): Promise<Service> {
		console.log('Mutation: removeServiceByAdmin');
		const serviceId = shapeIntoMongoObjectId(input);
		return await this.serviceService.removeServiceByAdmin(serviceId);
	}
}
