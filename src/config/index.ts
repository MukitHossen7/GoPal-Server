import dotenv from "dotenv";
dotenv.config();

export default {
  PORT: process.env.PORT as string,
  NODE_ENV: process.env.NODE_ENV as string,
  BCRYPTSALTROUND: process.env.BCRYPTSALTROUND as string,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL as string,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD as string,
  JWT: {
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET as string,
    ACCESS_TOKEN_EXPIRATION: process.env.ACCESS_TOKEN_EXPIRATION as string,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET as string,
    REFRESH_TOKEN_EXPIRATION: process.env.REFRESH_TOKEN_EXPIRATION as string,
    RESET_PASS_SECRET: process.env.RESET_PASS_SECRET as string,
    RESET_PASS_TOKEN_EXPIRES_IN: process.env
      .RESET_PASS_TOKEN_EXPIRES_IN as string,
  },
};
