import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { IJwtPayload } from "../../types/common";
import sendResponse from "../../utils/sendResponse";
import { ReviewService } from "./reviews.service";

const addReview = catchAsync(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const user = req.user as IJwtPayload;
    const result = await ReviewService.addReview(user, req.body);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Review added successfully",
      data: result,
    });
  }
);

const getReviewsForPlan = catchAsync(async (req: Request, res: Response) => {
  const { planId } = req.params;
  const result = await ReviewService.getReviewsForTravelPlan(planId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Reviews retrieved successfully",
    data: result,
  });
});

export const ReviewController = {
  addReview,
  getReviewsForPlan,
};
