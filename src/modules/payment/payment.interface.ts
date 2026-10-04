export interface IRequestRefund {
	amount: number;
	reason: string;
}

export interface IBkashCallback {
	paymentID: string;
	status: "success" | "failure" | "cancel";
	trxID?: string;
	amount?: string;
	[key: string]: unknown; 
}