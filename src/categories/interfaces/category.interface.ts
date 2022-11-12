export interface Category {
  readonly _id: string;
  readonly category: string;
  description: string;
  events: CategoryEvent[];
}

interface CategoryEvent {
  name: string;
  operation: string;
  value: number;
}
