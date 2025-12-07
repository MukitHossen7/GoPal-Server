import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";

import { pick } from "../../utils/pick";
import httpStatus from "http-status";
import { ActivityService } from "./activity.service";

const getSystemActivities = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ["type"]);
  const options = pick(req.query, ["page", "limit"]);
  const result = await ActivityService.getSystemActivities(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "System activities retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

export const ActivityController = {
  getSystemActivities,
};
