export interface IUpdateCustomerProfile {
	name?: string;
	phone?: string;
}

export interface ICreateServiceRequest {
	serviceType: string;
	description?: string;
	pickupLat: number;
	pickupLng: number;
}