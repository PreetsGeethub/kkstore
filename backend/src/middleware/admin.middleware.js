import ApiError from "../utils/ApiError.js";

const admin = (req, res, next) => {
    if (req.user.role !== "ADMIN") {
        throw new ApiError(
            403,
            "Admin access required."
        );
    }

    next();
};

export default admin;