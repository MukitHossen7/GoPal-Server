import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { IJwtPayload } from "../../types/common";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { UserService } from "./user.service";
import { pick } from "../../utils/pick";
import AppError from "../../errorHelpers/AppError";

const getAllTravelers = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ["searchTerm", "currentLocation", "gender"]);
  const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
  const result = await UserService.getAllTravelers(filters, options);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Travelers retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getTravelBuddyMatches = catchAsync(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const user = req.user as IJwtPayload;
    const result = await UserService.getRecommendedTravelers(user);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Recommended travelers retrieved successfully",
      data: result,
    });
  }
);

const getTravelerById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await UserService.getTravelerById(id);

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Traveler not found!");
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Traveler retrieved successfully",
    data: result,
  });
});

const getMyProfile = catchAsync(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const user = req.user as IJwtPayload;
    const result = await UserService.getMyProfile(user);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "My profile data fetched!",
      data: result,
    });
  }
);

const register = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  //  const file = req.file;
  const result = await UserService.register(payload);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Traveler registered successfully!",
    data: result,
  });
});

const updateMyProfile = catchAsync(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const user = req.user as IJwtPayload;
    // const profileImage = req.file?.path;
    const payload = {
      ...req.body,
      profileImage: req.file?.path,
    };

    const result = await UserService.updateMyProfile(user, payload);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "My profile updated!",
      data: result,
    });
  }
);

const softDeleteUser = catchAsync(async (req: Request, res: Response) => {
  const { travelerId } = req.params;
  await UserService.softDeleteUser(travelerId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User deleted successfully",
    data: null,
  });
});

export const UserController = {
  getAllTravelers,
  getMyProfile,
  getTravelerById,
  register,
  updateMyProfile,
  getTravelBuddyMatches,
  softDeleteUser,
};
