export const getPagination = (query: Record<string, any>) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.max(1, Math.min(Number(query.limit) || 20, 100));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

export const getSort = (query: Record<string, any>, defaultSort = '-createdAt') => {
  const sort = typeof query.sort === 'string' && query.sort ? query.sort : defaultSort;
  return sort;
};
