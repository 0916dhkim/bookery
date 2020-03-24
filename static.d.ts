/**
 * Static files are processed by webpack.
 */

declare module "*.svg" {
  const src: string;
  export default src;
}
