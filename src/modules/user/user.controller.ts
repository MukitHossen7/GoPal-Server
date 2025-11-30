import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { IJwtPayload } from "../../types/common";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { UserService } from "./user.service";

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  // const filters = pick(req.query, userFilterableFields) // searching , filtering
  // const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]) // pagination and sorting

  const result = await UserService.getAllUsers();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User retrive successfully!",
    // meta: result.meta,
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
    message: "Create Traveler successfully",
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

export const UserController = {
  getAllUsers,
  getMyProfile,
  register,
  updateMyProfile,
};
