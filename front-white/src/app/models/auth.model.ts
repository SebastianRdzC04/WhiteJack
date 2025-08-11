import { IUser } from "./user.model";



export interface loginModel {
    email: string;
    password: string;
}

export interface registerModel {
    fullName: string;
    email: string;
    password: string;
}

export interface registerResponse {
    message: string;
    data: {
        user: IUser;
    }
}