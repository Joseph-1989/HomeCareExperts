import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class AppResolver {
	@Query(() => String)
	public sayHello(): string {
		return 'Hello, This is GraphQL API Server';
	}
}
