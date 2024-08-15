import { ApolloDriver } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { T } from './libs/types/common';
import { ComponentsModule } from './components/components.module';
import { DatabaseModule } from './database/database.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppResolver } from './app.resolver';
import { SocketModule } from './socket/socket.module';

@Module({
	imports: [
		ConfigModule.forRoot(),
		GraphQLModule.forRoot({
			driver: ApolloDriver,
			playground: true,
			uploads: false,
			autoSchemaFile: true,
			formatError: (error: T) => {
				console.log('error code:', error);
				const graphQLFormattedError = {
					code: error?.extensions.code,
					message:
						error?.extensions?.exception?.response?.message ||
						error?.extensions?.exception?.response?.message ||
						error?.message,
				};
				console.log('GRAPHQL GLOBAL ERROR:', graphQLFormattedError);
				return graphQLFormattedError;
			},
		}),
		ComponentsModule,
		DatabaseModule,
		SocketModule,
	],
	controllers: [AppController],
	providers: [AppService, AppResolver],
})
export class AppModule {}
