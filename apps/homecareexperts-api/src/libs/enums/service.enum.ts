import { registerEnumType } from '@nestjs/graphql';

export enum ServiceCategory {
	ASSAMBLY = 'ASSAMBLY',
	MOUNTING = 'MOUNTING',
	MOVING = 'MOVING',
	OUTDOOR_HELP = 'OUTDOOR HELP',
	HOME_REPAIRS = 'HOME_REPAIRS',
	TRENDING = 'TRENDING',
	KITCHEN_REMODEL = 'KITCHEN_REMODEL',
	BUILD_A_HOUSE = 'BUILD_A_HOUSE',
	ROOF_REPLACEMENT = 'ROOF_REPLACEMENT',
	PLUMBING = 'PLUMBING',
	ELECTRICAL = 'ELECTRICAL',
	HVAC = 'HVAC',
	CLEANING = 'CLEANING',
	PAINTING = 'PAINTING',
	REMODELING = 'REMODELING',
	LANDSCAPING = 'LANDSCAPING',
	PEST_CONTROL = 'PEST_CONTROL',
	HANDYMAN = 'HANDYMAN',
	// ... add more categories as needed
}
registerEnumType(ServiceCategory, {
	name: 'ServiceCategory',
});

export enum ServiceStatus {
	AVAILABLE = 'AVAILABLE',
	NOT_AVAILABLE = 'NOT_AVAILABLE',
	DELETED = 'DELETED',
	// Add more statuses for finer-grained tracking (e.g., QUOTE_REQUESTED, ON_HOLD)
}

registerEnumType(ServiceStatus, {
	name: 'ServiceStatus',
});

export enum ServiceLocation {
	SEOUL = 'SEOUL',
	BUSAN = 'BUSAN',
	INCHEON = 'INCHEON',
	DAEGU = 'DAEGU',
	GYEONGJU = 'GYEONGJU',
	GWANGJU = 'GWANGJU',
	CHONJU = 'CHONJU',
	DAEJON = 'DAEJON',
	JEJU = 'JEJU',
}

registerEnumType(ServiceLocation, {
	name: 'ServiceLocation',
});

export enum ServicePricingModel {
	HOURLY_RATE = 'HOURLY_RATE',
	FLAT_FEE_PER_PROJECT = 'FLAT_FEE_PER_PROJECT',
	FREE_ESTIMATES = 'FREE_ESTIMATES',
}

registerEnumType(ServicePricingModel, {
	name: 'ServicePricingModel',
});
