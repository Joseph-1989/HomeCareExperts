import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
	private readonly logger: Logger = new Logger();
	public intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const recordTime = Date.now();
		const requestType = context.getType<GqlContextType>();

		if (requestType === 'http') {
			// Develop if needed
		} else if (requestType === 'graphql') {
			//  (1 ) Print request information

			const gqlContext = GqlExecutionContext.create(context);
			this.logger.log(` ${this.stringify(gqlContext.getContext().req.body)}`, 'REQUEST');

			// (2) => Errors handling via GraphQL
			// (3) => No errors, giving Response below
			return next.handle().pipe(
				tap((context) => {
					this.logger.log('Context inside tap:', context);
					console.log('context', context);
					const responseTime = Date.now() - recordTime;
					this.logger.log(` ${this.stringify(context)} - ${responseTime}ms  \n\n`, 'response');
				}),
			);
		}
	}
	private stringify(context: any): string {
		if (!context) {
			return 'undefined context';
		}
		console.log(typeof context);
		return JSON.stringify(context).slice(0, 75);
	}
}
