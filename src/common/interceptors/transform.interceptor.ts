import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces';

// Type guard to check if data is already an ApiResponse
function isApiResponse<T>(data: unknown): data is ApiResponse<T> {
  return (
    typeof data === 'object' &&
    data !== null &&
    'success' in data &&
    'message' in data &&
    'timestamp' in data
  );
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data: T): ApiResponse<T> => {
        // If data is already formatted as ApiResponse, return as-is
        if (isApiResponse<T>(data)) {
          return data;
        }

        // Otherwise, wrap in ApiResponse format
        return {
          success: true,
          message: 'Request processed successfully',
          data,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
