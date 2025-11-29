import cors from "cors";
import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import config from "./config";
import routes from "./routes/routes";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import notFound from "./middlewares/notFound";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// routes
app.use("/api/v1", routes);

app.get("/", (req: Request, res: Response) => {
  res.send({
    success: true,
    message: "Welcome to PrismaX Server",
    environment: config.NODE_ENV,
  });
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;
