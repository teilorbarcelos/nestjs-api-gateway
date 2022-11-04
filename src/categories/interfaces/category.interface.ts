export interface Category {
  readonly _id: string;
  readonly category: string;
  description: string;
  events: Array<CategoryEvent>;
}

interface CategoryEvent {
  name: string;
  operation: string;
  value: number;
}
