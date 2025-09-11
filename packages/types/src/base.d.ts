/**
 * Base Types
 *
 * Generic base types that can be used across different platforms
 */
export type GenericId<TableName extends string = string> = string & {
    __tableName: TableName;
};
export type Timestamp = number;
export interface BaseEntity {
    _id: GenericId;
    _creationTime?: Timestamp;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}
export type StatusType = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
export interface PaginationParams {
    limit?: number;
    cursor?: string;
}
export interface PaginatedResponse<T> {
    data: T[];
    nextCursor?: string;
    hasMore: boolean;
    total?: number;
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, any>;
}
//# sourceMappingURL=base.d.ts.map