export type Filter<T> = {
  filter(query: string): Iterable<T>;
};
