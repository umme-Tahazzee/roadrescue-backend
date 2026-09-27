import { OAuth2Client } from "google-auth-library";
import config from "../config";
import { AppError } from "../utils/AppError";



export const googleClient = new OAuth2Client(config.google_client_id);

export const verficationGoogleToken = async (idToken : string) =>{
     const ticket = await googleClient.verifyIdToken({
         idToken,
         audience : config.google_client_id
     })

    const payload = ticket.getPayload()
    if(!payload || !payload.email){
        throw new AppError("Invalid Google Token", 404)
    }
    return {
		email: payload.email,
		name: payload.name || "Google User",
		googleId: payload.sub
		
	};
}