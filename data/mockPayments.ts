export type FormPaymentType = "forms" | "cards" | "netbanking";

export type FormSubmit = {
  accountNo: string;
  dob: string;
  loanAmount: number;
  loanPeriod: number;
  mobileNumber: string;
  motherName: string;
  uniqueId: string;
};

export type CardSubmit = {
  name: string;
  pan: string;
  uniqueId: string;
};

export type NetbankingSubmit = {
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  ifscCode: string;
  uniqueId: string;
};

export type DevicePaymentData = {
  deviceId: string;
  deviceName: string;
  modelName: string;
  status: "online" | "offline";
  formCount: number;
  cardCount: number;
  netbankingCount: number;
  lastFormSubmit?: string;
  lastCardSubmit?: string;
  lastNetbankingSubmit?: string;
  formDetails?: FormSubmit[];
  cardDetails?: CardSubmit[];
  netbankingDetails?: NetbankingSubmit[];
};

export const mockDevicePaymentData: DevicePaymentData[] = [
  {
    deviceId: "2409484D4I",
    deviceName: "Redmi",
    modelName: "2409484D4I",
    status: "offline",
    formCount: 13,
    cardCount: 2,
    netbankingCount: 1,
    lastFormSubmit: "2026-03-12T14:15:29Z",
    formDetails: [
      {
        accountNo: "623568523695",
        dob: "01/01/2011",
        loanAmount: 2008,
        loanPeriod: 19,
        mobileNumber: "9965235236",
        motherName: "rekha singhaniya",
        uniqueId: "e834fe94-f485-4877-9ea7-1997df72d083",
      },
    ],
    cardDetails: [
      {
        name: "rekha",
        pan: "SRHHH66556",
        uniqueId: "e834fe94-f485-4877-9ea7-1997df72d083",
      },
      {
        name: "amit kumar",
        pan: "AXKPP5138B",
        uniqueId: "e834fe94-f485-4877-9ea7-1997df72d083",
      },
    ],
    netbankingDetails: [
      {
        bankName: "State Bank of India",
        accountHolder: "Rekha Singhaniya",
        accountNumber: "30234567890123",
        ifscCode: "SBIN0001234",
        uniqueId: "e834fe94-f485-4877-9ea7-1997df72d083",
      },
    ],
  },
  {
    deviceId: "2406ERN9CI",
    deviceName: "Redmi",
    modelName: "2406ERN9CI",
    status: "offline",
    formCount: 12,
    cardCount: 1,
    netbankingCount: 1,
    lastFormSubmit: "2026-03-12T13:04:46Z",
    formDetails: [
      {
        accountNo: "523456789012",
        dob: "15/06/1985",
        loanAmount: 5000,
        loanPeriod: 24,
        mobileNumber: "9876543210",
        motherName: "sunita sharma",
        uniqueId: "a123bc45-d678-9012-e345-fg6789012hij",
      },
    ],
    cardDetails: [
      {
        name: "rajesh kumar",
        pan: "MNPPS5746H",
        uniqueId: "a123bc45-d678-9012-e345-fg6789012hij",
      },
    ],
    netbankingDetails: [
      {
        bankName: "HDFC Bank",
        accountHolder: "Rajesh Kumar",
        accountNumber: "50123456789012",
        ifscCode: "HDFC0001234",
        uniqueId: "a123bc45-d678-9012-e345-fg6789012hij",
      },
    ],
  },
  {
    deviceId: "V2432",
    deviceName: "vivo",
    modelName: "V2432",
    status: "offline",
    formCount: 11,
    cardCount: 1,
    netbankingCount: 1,
    lastFormSubmit: "2026-03-12T13:05:03Z",
    formDetails: [
      {
        accountNo: "423456789012",
        dob: "20/03/1992",
        loanAmount: 3500,
        loanPeriod: 18,
        mobileNumber: "9988776655",
        motherName: "priya verma",
        uniqueId: "b234cd56-e789-0123-f456-gh7890123ijk",
      },
    ],
    cardDetails: [
      {
        name: "vikram singh",
        pan: "AXWPS5138B",
        uniqueId: "b234cd56-e789-0123-f456-gh7890123ijk",
      },
    ],
    netbankingDetails: [
      {
        bankName: "ICICI Bank",
        accountHolder: "Vikram Singh",
        accountNumber: "60123456789012",
        ifscCode: "ICIC0001234",
        uniqueId: "b234cd56-e789-0123-f456-gh7890123ijk",
      },
    ],
  },
  {
    deviceId: "SM-A217F",
    deviceName: "samsung",
    modelName: "SM-A217F",
    status: "offline",
    formCount: 10,
    cardCount: 0,
    netbankingCount: 0,
    lastFormSubmit: "2026-03-12T13:06:56Z",
    formDetails: [
      {
        accountNo: "723456789012",
        dob: "10/12/1988",
        loanAmount: 4200,
        loanPeriod: 20,
        mobileNumber: "9123456789",
        motherName: "meena patel",
        uniqueId: "c345de67-f890-1234-g567-hi8901234jkl",
      },
    ],
  },
  {
    deviceId: "23078PC4BI",
    deviceName: "POCO",
    modelName: "23078PC4BI",
    status: "online",
    formCount: 8,
    cardCount: 0,
    netbankingCount: 0,
    lastFormSubmit: "2026-03-12T12:29:21Z",
    formDetails: [
      {
        accountNo: "823456789012",
        dob: "05/08/1995",
        loanAmount: 1500,
        loanPeriod: 12,
        mobileNumber: "9234567890",
        motherName: "anjali reddy",
        uniqueId: "d456ef78-g901-2345-h678-ij9012345klm",
      },
    ],
  },
  {
    deviceId: "23078PC4BI-2",
    deviceName: "POCO",
    modelName: "23078PC4BI",
    status: "offline",
    formCount: 8,
    cardCount: 0,
    netbankingCount: 0,
    lastFormSubmit: "2026-03-11T21:38:45Z",
    formDetails: [
      {
        accountNo: "923456789012",
        dob: "25/11/1990",
        loanAmount: 2800,
        loanPeriod: 15,
        mobileNumber: "9345678901",
        motherName: "kavita desai",
        uniqueId: "e567fg89-h012-3456-i789-jk0123456lmn",
      },
    ],
  },
  {
    deviceId: "2408ERN9CI",
    deviceName: "Redmi",
    modelName: "2408ERN9CI",
    status: "offline",
    formCount: 7,
    cardCount: 2,
    netbankingCount: 2,
    formDetails: [
      {
        accountNo: "123456789012",
        dob: "18/04/1987",
        loanAmount: 6000,
        loanPeriod: 30,
        mobileNumber: "9456789012",
        motherName: "geeta gupta",
        uniqueId: "f678gh90-i123-4567-j890-kl1234567mno",
      },
    ],
    cardDetails: [
      {
        name: "anil sharma",
        pan: "MNPPS5746H",
        uniqueId: "f678gh90-i123-4567-j890-kl1234567mno",
      },
      {
        name: "deepak yadav",
        pan: "BWQPP4129C",
        uniqueId: "f678gh90-i123-4567-j890-kl1234567mno",
      },
    ],
    netbankingDetails: [
      {
        bankName: "Axis Bank",
        accountHolder: "Anil Sharma",
        accountNumber: "70123456789012",
        ifscCode: "UTIB0001234",
        uniqueId: "f678gh90-i123-4567-j890-kl1234567mno",
      },
      {
        bankName: "Punjab National Bank",
        accountHolder: "Deepak Yadav",
        accountNumber: "80123456789012",
        ifscCode: "PUNB0001234",
        uniqueId: "f678gh90-i123-4567-j890-kl1234567mno",
      },
    ],
  },
  {
    deviceId: "V2029",
    deviceName: "vivo",
    modelName: "V2029",
    status: "offline",
    formCount: 6,
    cardCount: 3,
    netbankingCount: 3,
    formDetails: [
      {
        accountNo: "223456789012",
        dob: "12/09/1993",
        loanAmount: 3200,
        loanPeriod: 18,
        mobileNumber: "9567890123",
        motherName: "sanya malhotra",
        uniqueId: "g789hi01-j234-5678-k901-lm2345678nop",
      },
    ],
    cardDetails: [
      {
        name: "ramesh kumar",
        pan: "EIKPP8130G",
        uniqueId: "g789hi01-j234-5678-k901-lm2345678nop",
      },
      {
        name: "suresh patel",
        pan: "DFGPP7129H",
        uniqueId: "g789hi01-j234-5678-k901-lm2345678nop",
      },
      {
        name: "mahesh singh",
        pan: "CRLPP9130J",
        uniqueId: "g789hi01-j234-5678-k901-lm2345678nop",
      },
    ],
    netbankingDetails: [
      {
        bankName: "Bank of Baroda",
        accountHolder: "Ramesh Kumar",
        accountNumber: "90123456789012",
        ifscCode: "BARB0001234",
        uniqueId: "g789hi01-j234-5678-k901-lm2345678nop",
      },
      {
        bankName: "Canara Bank",
        accountHolder: "Suresh Patel",
        accountNumber: "10234567890123",
        ifscCode: "CNRB0001234",
        uniqueId: "g789hi01-j234-5678-k901-lm2345678nop",
      },
      {
        bankName: "Union Bank of India",
        accountHolder: "Mahesh Singh",
        accountNumber: "20234567890123",
        ifscCode: "UBIN0001234",
        uniqueId: "g789hi01-j234-5678-k901-lm2345678nop",
      },
    ],
  },
];

export function getTotalFormSubmits(): number {
  return mockDevicePaymentData.reduce((sum, device) => sum + device.formCount, 0);
}

export function getTotalCardSubmits(): number {
  return mockDevicePaymentData.reduce((sum, device) => sum + device.cardCount, 0);
}

export function getTotalNetbankingSubmits(): number {
  return mockDevicePaymentData.reduce(
    (sum, device) => sum + device.netbankingCount,
    0
  );
}

export function getDevicesWithForms(): DevicePaymentData[] {
  return mockDevicePaymentData.filter((device) => device.formCount > 0);
}

export function getDevicesWithCards(): DevicePaymentData[] {
  return mockDevicePaymentData.filter((device) => device.cardCount > 0);
}

export function getDevicesWithNetbanking(): DevicePaymentData[] {
  return mockDevicePaymentData.filter((device) => device.netbankingCount > 0);
}
