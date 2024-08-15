import { ServiceCategory, ServiceLocation, ServicePricingModel, ServiceStatus } from '../libs/enums/service.enum';
import { Schema } from 'mongoose';

const ServiceSchema = new Schema(
	{
		serviceCategory: {
			type: String,
			enum: ServiceCategory,
			required: true,
		},
		serviceStatus: {
			type: String,
			enum: ServiceStatus,
			default: ServiceStatus.AVAILABLE,
		},
		serviceLocation: {
			type: String,
			enum: ServiceLocation,
			required: true,
		},
		pricingModel: {
			type: String,
			enum: ServicePricingModel,
			required: true,
		},
		serviceAddress: {
			type: String,
			required: true,
		},
		serviceTitle: {
			type: String,
			required: true,
		},
		servicePrice: {
			type: Number,
			required: true,
		},
		assistanceDIY: {
			type: Boolean,
			default: false,
		},
		subscriptionModel: {
			type: Boolean,
			default: false,
		},
		emergencyServices: {
			type: Boolean,
			default: false,
		},
		referralPrograms: {
			type: Boolean,
			default: false,
		},
		serviceViews: {
			type: Number,
			default: 0,
		},
		serviceLikes: {
			type: Number,
			default: 0,
		},
		serviceComments: {
			type: Number,
			default: 0,
		},
		serviceRank: {
			type: Number,
			default: 0,
		},
		serviceImages: {
			type: [String],
			required: true,
		},
		serviceDescription: {
			type: String,
		},
		memberId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Member',
		},
		stoppedAt: {
			type: Date,
		},
		deletedAt: {
			type: Date,
		},
	},
	{ timestamps: true, collection: 'services' },
);

ServiceSchema.index({ serviceCategory: 1, serviceLocation: 1, serviceTitle: 1, servicePrice: 1 }, { unique: true });

export default ServiceSchema;
