
export type PPPoE = {
    id: string;
    name: string;
    profile: string;
    servicename: string;
    station: string;
    pool: string;
    platformID?: string;
    devices: string;
    price: string;
    usage?: string;
    period: string;
    status: string;
    clientname: string;
    clientpassword: string;
    interface: string;
    maxsessions: string;
    localaddress?: string;
    DNSserver?: string;
    paymentLink: string;
    email:string;
    amount: string;
    createdAt?: string;
    updatedAt?: string;
    expiresAt?: string;
};

export type TimeInterval = {
  label: string;
  seconds: number;
};
