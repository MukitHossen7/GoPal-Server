import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";

const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode: number = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
  let success = false;
  let message = err.message || "Something went wrong!";
  let error = err;

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      statusCode = httpStatus.BAD_REQUEST;
      message = `Unique constraint failed on the field: ${err.meta?.target}`;
      error = {
        code: err.code,
        meta: err.meta,
      };
    }
    if (err.code === "P2025") {
      statusCode = httpStatus.NOT_FOUND;
      message = `Record not found: ${err.meta?.cause || ""}`;
      error = {
        code: err.code,
        meta: err.meta,
      };
    }
    if (err.code === "P2003") {
      statusCode = httpStatus.BAD_REQUEST;
      message = `Foreign key constraint failed on the field: ${err.meta?.field_name}`;
      error = {
        code: err.code,
        meta: err.meta,
      };
    }
    if (err.code === "P2004") {
      statusCode = httpStatus.BAD_REQUEST;
      message = `A constraint failed: ${err.meta?.constraint_name}`;
      error = {
        code: err.code,
        meta: err.meta,
      };
    }
    if (err.code === "P2001") {
      statusCode = httpStatus.NOT_FOUND;
      message = `The record searched for in the where condition does not exist: ${err.meta?.model_name}`;
      error = {
        code: err.code,
        meta: err.meta,
      };
    }
    if (err.code === "P1000") {
      statusCode = httpStatus.INTERNAL_SERVER_ERROR;
      message = `Authentication failed against database: ${err.meta?.database_name}`;
      error = {
        code: err.code,
        meta: err.meta,
      };
    }
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Prisma Client Validation Error";
    error = {
      message: err.message,
      // stack: err.stack,
    };
  } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = "An unknown error occurred in Prisma Client";
    error = {
      message: err.message,
      // stack: err.stack,
    };
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = "Prisma Client Initialization Error";
    error = {
      message: err.message,
      // stack: err.stack,
    };
  }

  res.status(statusCode).json({
    success,
    message,
    error,
  });
};

export default globalErrorHandler;
