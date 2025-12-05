import { Request, Response } from "express";
import { IJwtPayload } from "../../types/common";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { StatsService } from "./stats.service";

const getTravelerDashboardData = catchAsync(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const user = req.user as IJwtPayload;
    const result = await StatsService.getTravelerDashboardData(user);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Dashboard data retrieved successfully",
      data: result,
    });
  }
);

export const StatsController = {
  getTravelerDashboardData,
};
