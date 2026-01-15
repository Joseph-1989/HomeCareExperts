import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
	imports: [
		HttpModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				secret: process.env.SECRET_TOKEN,
				signOptions: { expiresIn: '30d' },
			}),
		}),
	],
	providers: [AuthService],
	exports: [AuthService],
})
export class AuthModule { }
