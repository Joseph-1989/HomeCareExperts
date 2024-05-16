import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { MemberService } from './member.service';
import { InternalServerErrorException } from '@nestjs/common';
import { LoginInput, MemberInput } from '../../libs/dto/member/member.input';
import { Member } from '../../libs/dto/member/member';

@Resolver()
export class MemberResolver {
	constructor(private readonly memberService: MemberService) {}

	@Mutation(() => Member)
	public async signup(@Args('input') input: MemberInput): Promise<Member> {
		console.log('Mutation: signup');
		console.log('input:', input);
		return await this.memberService.signup(input);
	}
	@Mutation(() => Member)
	public async login(@Args('input') input: LoginInput): Promise<Member> {
		console.log('Mutation: login');
		console.log('input:', input);
		return await this.memberService.login(input);
	}

	// AUTHENTICATED
	@Mutation(() => String)
	public async updateMember(): Promise<string> {
		console.log('Mutation: updateMember');
		return await this.memberService.updateMember();
	}

	@Query(() => Member)
	public async getMember(): Promise<string> {
		console.log('Query: getMember');
		return await this.memberService.getMember();
	}

	// ADMIN

	// AUTHORIZATION: ADMIN

	@Mutation(() => String)
	public async getAllMembersByAdmin(): Promise<string> {
		console.log('getAllMembersByAdmin');
		return await this.memberService.getAllMembersByAdmin();
	}

	// AUTHORIZATION: ADMIN

	@Mutation(() => String)
	public async updateMemberByAdmin(): Promise<string> {
		console.log('Updating member by admin');
		return await this.memberService.updateMemberByAdmin();
	}
}
