"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedAdmin = seedAdmin;
const config_1 = __importDefault(require("../config"));
const db_1 = require("../config/db");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
function seedAdmin() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const isAdminExists = yield db_1.prisma.user.findUnique({
                where: {
                    email: config_1.default.ADMIN_EMAIL,
                    role: "ADMIN",
                },
            });
            if (isAdminExists) {
                console.log("Admin already exists");
                return;
            }
            const hashPassword = yield bcryptjs_1.default.hash(config_1.default.ADMIN_PASSWORD, Number(config_1.default.BCRYPTSALTROUND));
            yield db_1.prisma.$transaction((tnx) => __awaiter(this, void 0, void 0, function* () {
                yield tnx.user.create({
                    data: {
                        email: config_1.default.ADMIN_EMAIL,
                        password: hashPassword,
                        role: "ADMIN",
                        isVerified: true,
                        gender: "MALE",
                    },
                });
                yield tnx.admin.create({
                    data: {
                        name: "Admin Hossen",
                        email: config_1.default.ADMIN_EMAIL,
                        contactNumber: "01623568974",
                        address: "Dhaka, Bangladesh",
                        profileImage: "https://img.freepik.com/free-photo/closeup-scarlet-macaw-from-side-view-scarlet-macaw-closeup-head_488145-3540.jpg?semt=ais_hybrid&w=740&q=80",
                    },
                });
            }));
        }
        catch (error) {
            console.log(error);
        }
    });
}
