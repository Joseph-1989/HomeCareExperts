import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
	getHello(): string {
		return 'Hello, Welcome to HomeCareExperts API SERVER!';
	}
}
