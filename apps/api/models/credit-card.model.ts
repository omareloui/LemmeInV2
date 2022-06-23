import db from "../db/db.ts";

export interface CreditCardSchema {
  _id: string;
  user: string;

  nameOnCard: string;
  cardNumber: string;
  expirationDate: string; // mm/yy
  cvv: string;
  cardType: string; // eg. Master Card / Visa etc...

  address: {
    country: string;
    state: string;
    city: string;
    addressLineOne: string;
    addressLineTwo: string;
    zipCode: number;
  };

  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export const CreditCard =
  db.getDatabase.collection<CreditCardSchema>("credit-cards");
