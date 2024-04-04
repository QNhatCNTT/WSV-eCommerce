"use strict";

const statusCode = {
    FORBIDEN: 403,
    CONFLICT: 409,
};

const ReasonStatusCode = {
    FORBIDEN: "Bad Request error",
    CONFLICT: "Conflict error",
};

class ErrorResponse extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
    }
}

class ConflictRequestError extends ErrorResponse {
    constructor(message = ReasonStatusCode.CONFLICT, status = statusCode.CONFLICT) {
        super(message, status);
    }
}

class BadRequestError extends ErrorResponse {
    constructor(message = ReasonStatusCode.FORBIDEN, status = statusCode.FORBIDEN) {
        super(message, status);
    }
}

module.exports = {
    ConflictRequestError,
    BadRequestError,
};
