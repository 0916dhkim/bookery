export interface Queryable {
  /**
   * Tests this instance for fuzzy query string.
   * Return 0 if the pattern does not match this instance.
   * Return relevance if the pattern matches.
   * @param queryString Fuzzy pattern for the query.
   */
  query(queryString: string): number;
}
