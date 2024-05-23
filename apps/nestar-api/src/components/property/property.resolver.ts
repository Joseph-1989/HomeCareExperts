import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { PropertyService } from './property.service';
import { PropertyInput } from '../../libs/dto/property /property.input';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MemberType } from '../../libs/enums/member.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ObjectId } from 'mongoose';
import { Property } from '../../libs/dto/property /property';

@Resolver()
export class PropertyResolver {
	constructor(private readonly propertyService: PropertyService) {}

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
}
