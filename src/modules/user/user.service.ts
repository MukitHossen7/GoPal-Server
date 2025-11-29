import { IJwtPayload } from "../../types/common";

const getAllUsers = async () => {};

const getMyProfile = async (user: IJwtPayload) => {};

export const UserService = {
  getMyProfile,
  getAllUsers,
};
