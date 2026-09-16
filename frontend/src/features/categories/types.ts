export const categoryTypes = ["income", "expense"] as const;
export type CategoryType = (typeof categoryTypes)[number];

export type Category = {
  id: string;
  name: string;
  type: CategoryType;
  icon: string;
  isSystem: boolean;
};

export type CategoriesListResponse = {
  categories: Category[];
};

export type CategoryResponse = {
  category: Category;
};

