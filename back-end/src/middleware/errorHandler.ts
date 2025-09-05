import { Request, Response, NextFunction } from "express";

// Custom Error Interface
interface ErrorWithStatus extends Error {
    statusCode?: number;
}

const errorHandler = (
    err: ErrorWithStatus,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error("❌ Error:", err.message);

    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
        stack: process.env.NODE_ENV === "production" ? null : err.stack
    });
};

export default errorHandler;
