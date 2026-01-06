import { HttpException } from '@nestjs/common';
import { StatusCodes } from 'http-status-codes';

export enum ErrorCode {
  PROCESSING_ERROR = 'PROCESSING_ERROR',
  UNRECOGNIZED = 'UNRECOGNIZED',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  NOT_FOUND = 'NOT_FOUND',
  BAD_REQUEST = 'BAD_REQUEST',
  CONFLICT = 'CONFLICT',
  UNAUTHORIZED = 'UNAUTHORIZED',
}

export abstract class AppError extends HttpException {
  protected constructor(
    message: string,
    public readonly httpCode: StatusCodes,
    public readonly errorCode: ErrorCode = ErrorCode.UNRECOGNIZED,
    public readonly details: unknown = {},
  ) {
    super({ message, errorCode, details }, httpCode);
  }
}

export class AlreadyExistsError extends AppError {
  constructor(entity?: string, field?: string) {
    super(
      `${entity} already exists`,
      StatusCodes.CONFLICT,
      ErrorCode.ALREADY_EXISTS,
      {
        entity,
        field,
      },
    );
  }
}

export class NotFoundError extends AppError {
  constructor(entity?: string, field?: string) {
    super(
      `${entity} is not found`,
      StatusCodes.NOT_FOUND,
      ErrorCode.NOT_FOUND,
      {
        entity,
        field,
      },
    );
  }
}

export class ProcessingError extends AppError {
  constructor(message: string, details?: unknown) {
    super(
      message,
      StatusCodes.UNPROCESSABLE_ENTITY,
      ErrorCode.PROCESSING_ERROR,
      details,
    );
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, StatusCodes.BAD_REQUEST, ErrorCode.BAD_REQUEST, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, StatusCodes.UNAUTHORIZED, ErrorCode.UNAUTHORIZED, details);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, StatusCodes.CONFLICT, ErrorCode.CONFLICT, details);
  }
}

