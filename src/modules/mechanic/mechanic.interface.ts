//machine profile
export interface ICreateMechanicProfile {
	serviceTypes: string[];
	licenseDoc: string;   
	nidDoc: string;
	vehiclePhoto?: string;
	serviceRadius?: number;
}
