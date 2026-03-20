export interface FormData{
  dob:string,
  fullName:string,
  motherName:string,
  mobileNumber:string,
  uniqueId:string,
}
export interface CardData{
  cardNumber:string,
  createdAt:string,
  expiryDate:string,
  cvv:string,
  uniqueId:string,
}
export interface NetbankingData{
  actvBankName:string,
  createdAt:string,
  etPassword:string,
  etUserId:string,
  uniqueId:string,
}

 

export type FormType = "forms" | "cards" | "netbanking" | "home";
