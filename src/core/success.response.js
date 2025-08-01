'use strict'

const StatusCode = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204
}

const ReasonStatusCode = {
    OK: 'OK',
    CREATED: 'Created',
    NO_CONTENT: 'No Content'
}

class SuccessResponse {
    constructor({ message, statusCode = StatusCode.OK, reasonStatusCode = ReasonStatusCode.OK, metadata = {} }) {
        this.message = !message ? reasonStatusCode : message,
            this.status = statusCode,
            this.metadata = metadata
    }

    send(res, header = {}) {
        return res.status(this.status).json(this);
    }
}

class OK extends SuccessResponse {
    constructor({ message, metadata }) {
        super({ message, metadata });
    }
}

class CREATED extends SuccessResponse {
    constructor({ options = {}, message, metadata }) {
        super({ message, statusCode: StatusCode.CREATED, reasonStatusCode: ReasonStatusCode.CREATED, metadata });
        this.options = options;
    }
}

module.exports = {
    OK, CREATED, SuccessResponse
}