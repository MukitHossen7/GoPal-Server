"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setAuthCookie = void 0;
const setAuthCookie = (res, authToken) => {
    if (authToken.accessToken) {
        res.cookie("accessToken", authToken.accessToken, {
            secure: true,
            httpOnly: true,
            sameSite: "none",
            maxAge: 1000 * 60 * 60 * 24,
        });
    }
    if (authToken.refreshToken) {
        res.cookie("refreshToken", authToken.refreshToken, {
            secure: true,
            httpOnly: true,
            sameSite: "none",
            maxAge: 1000 * 60 * 60 * 24 * 90,
        });
    }
};
exports.setAuthCookie = setAuthCookie;
