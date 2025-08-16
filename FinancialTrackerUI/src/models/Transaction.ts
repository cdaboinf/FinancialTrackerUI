// models/Transaction.ts

import { Category } from "./Category";

export interface Transaction {
  userId: string;        // Guid
  date: string;          // ISO format date string
  description: string;
  amount: number;
  vendor?: string;
  category: Category;
}
