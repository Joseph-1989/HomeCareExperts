import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FaqService } from './faq.service';
import { FaqResolver } from './faq.resolver';
import { Faq } from '../../libs/dto/faq/faq';
import FaqSchema from '../../schemas/Faq.model';

@Module({
	imports: [MongooseModule.forFeature([{ name: Faq.name, schema: FaqSchema }])],
	providers: [FaqService, FaqResolver],
})
export class FaqModule {}
