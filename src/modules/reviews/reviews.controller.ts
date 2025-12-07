import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { IJwtPayload } from "../../types/common";
import sendResponse from "../../utils/sendResponse";
import { ReviewService } from "./reviews.service";
import { pick } from "../../utils/pick";

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

const getAllReviews = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
  const result = await ReviewService.getAllReviews(options);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "All reviews retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const updateReview = catchAsync(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const user = req.user as IJwtPayload;
    const { reviewId } = req.params;
    const result = await ReviewService.updateReview(user, reviewId, req.body);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Review updated successfully",
      data: result,
    });
  }
);

const deleteReview = catchAsync(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const user = req.user as IJwtPayload;
    const { reviewId } = req.params;
    await ReviewService.deleteReview(user, reviewId);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Review deleted successfully",
      data: null,
    });
  }
);

export const ReviewController = {
  addReview,
  getReviewsForPlan,
  getAllReviews,
  updateReview,
  deleteReview,
};
