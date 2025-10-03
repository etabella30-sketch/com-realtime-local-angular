export interface LoginRequestMdl {
    cEmail: string;
    password: string;
    cRTKey: string;
}

export interface UserDetail {
    nUserid?:string;
    cEmail?:string;
    cFname?:string;
    cLname?:string;
    cProfile?:string;
    isAdmin?:boolean;
}
export interface LoginResponce {
    msg: Number;
    value: string;
    userDetail:UserDetail;
    token?:string;
    expir_limit:number;
}

export interface setUserInfo {
    nUserid:string;
    cFname:string;
    cLname:string;
    cEmail:string;
    cProfile:string | null;
    isAdmin:boolean;
}
