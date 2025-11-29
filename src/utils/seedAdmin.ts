import config from "../config";
import { prisma } from "../config/db";
import bcrypt from "bcryptjs";

export async function seedAdmin() {
  try {
    const isAdminExists = await prisma.user.findUnique({
      where: {
        email: config.ADMIN_EMAIL,
        role: "ADMIN",
      },
    });
    if (isAdminExists) {
      console.log("Admin already exists");
      return;
    }
    const hashPassword = await bcrypt.hash(
      config.ADMIN_PASSWORD,
      Number(config.BCRYPTSALTROUND)
    );

    await prisma.$transaction(async (tnx) => {
      await tnx.user.create({
        data: {
          email: config.ADMIN_EMAIL,
          password: hashPassword,
          role: "ADMIN",
          isVerified: true,
          gender: "MALE",
        },
      });

      await tnx.admin.create({
        data: {
          name: "Admin Hossen",
          email: config.ADMIN_EMAIL,
          contactNumber: "01623568974",
          address: "Dhaka, Bangladesh",
          profilePhoto:
            "https://img.freepik.com/free-photo/closeup-scarlet-macaw-from-side-view-scarlet-macaw-closeup-head_488145-3540.jpg?semt=ais_hybrid&w=740&q=80",
        },
      });
    });
  } catch (error) {
    console.log(error);
  }
}
