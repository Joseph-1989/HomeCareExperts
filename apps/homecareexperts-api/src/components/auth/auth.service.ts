import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { Member } from '../../libs/dto/member/member';
import { T } from '../../libs/types/common';
@Injectable()
export class AuthService {
	constructor(private JwtService: JwtService) {}
	public async hashPassword(memberPassword: string): Promise<string> {
		const salt = await bcrypt.genSalt();
		return await bcrypt.hash(memberPassword, salt);
	}

	public async comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
		return await bcrypt.compare(password, hashedPassword);
	}

	public async createToken(member: Member): Promise<string> {
		const payload: T = {};
		Object.keys(member['_doc'] ? member['_doc'] : member).map((ele) => {
			payload[`${ele}`] = member[`${ele}`];
		});

		delete payload.memberPassword;
		return await this.JwtService.signAsync(payload);
	}

	public async verifyToken(token: string): Promise<Member> {
		try {
			const member = await this.JwtService.verifyAsync(token);
			member._id = shapeIntoMongoObjectId(member._id);
			return member;
		} catch (error) {
			if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
				// Handle expired or invalid tokens explicitly.
				// You can also log this error for debugging.
				return null; // Or throw new AuthenticationError('Token verification failed')
			} else {
				// Rethrow unexpected errors
				throw error;
			}
		}
	}
}
