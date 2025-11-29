export type TOptions = {
  page?: string | number;
  limit?: string | number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export const calculatePagination = (options: TOptions) => {
  const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 10;
  const skip = (page - 1) * limit;
  const sortBy = (options.sortBy || "createdAt") as string;
  const sortOrder = (options.sortOrder || "desc") as string;

  return {
    page,
    limit,
    skip,
    sortBy,
    sortOrder,
  };
};
