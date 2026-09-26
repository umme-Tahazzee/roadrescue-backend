export interface IRegister {
     name : string,
     email : string,
     password: string,
     mechanicProfile: {
           phone ?: string
     }
}