export type ResponseWithPagination<T, K extends string> = {
  [P in K]: T[];
} & {
  pagination: {
    currentPage: number;
    totalPages: number;
    totalProducts: number;
    hasNextPage: number;
    hasPrevPage: number;
  };
};
