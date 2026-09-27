import { Role } from "../../../prisma/generated/prisma/enums"

export interface IRegisterCustomer {
     name : string,
     email : string,
     password: string,
     role : Role
     
}


export interface IVerifyEmailPayload{
       email :string,
       otp : string
}


export interface  ILoginUserPayload {
      email : string,
      password: string,
}
