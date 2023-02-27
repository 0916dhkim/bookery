# Bookery

Web application for managing book clubs.

## Contribution Guide

### How to Run

1. Fork & clone the repo.
1. Install dependencies.

   ```
   pnpm i
   ```

1. Run CockroachDB.

   There are three options:

   - Use docker to start a local cluster.

     ```
     docker run -it --rm -p 26257:26257 -p 8080:8080 --env COCKROACH_DATABASE=<database_name> --env COCKROACH_USER=<user_name> --env COCKROACH_PASSWORD=<password> cockroachdb/cockroach:latest start-single-node
     ```

   - Install CockroachDB locally and start a local cluster. ([docs](https://www.cockroachlabs.com/docs/stable/start-a-local-cluster.html))
   - Start a cloud cluster. ([docs](https://www.cockroachlabs.com/docs/cockroachcloud/quickstart))

1. Create `.env` file in the project root directory. See `.env.sample` file to see which variables are needed.

1. Run
   ```
   pnpm dev
   ```
