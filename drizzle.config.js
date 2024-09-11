/** @type { import("drizzle-kit").Config } */
export default {
    schema: "./utils/schema.tsx",
    dialect: 'postgresql',
    dbCredentials: {
      url: 'postgresql://neondb_owner:P0sVZftWQJ2e@ep-twilight-snowflake-a50i3kbv.us-east-2.aws.neon.tech/AI_content_genrator?sslmode=require',
    }
  };