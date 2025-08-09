/**
 * Generic Repository Interface
 * 
 * Provides a clean abstraction over data persistence operations.
 * This interface can be implemented for different data sources (Convex, REST API, etc.)
 */
export interface IRepository<T, TId = string> {
  // Read operations
  findById(id: TId): Promise<T | null>;
  findAll(): Promise<T[]>;
  findBy(criteria: Partial<T>): Promise<T[]>;
  findOne(criteria: Partial<T>): Promise<T | null>;
  
  // Write operations
  create(entity: Omit<T, '_id'>): Promise<T>;
  update(id: TId, updates: Partial<T>): Promise<T>;
  delete(id: TId): Promise<boolean>;
  
  // Batch operations
  createMany(entities: Omit<T, '_id'>[]): Promise<T[]>;
  updateMany(criteria: Partial<T>, updates: Partial<T>): Promise<T[]>;
  deleteMany(criteria: Partial<T>): Promise<number>;
  
  // Utility operations
  count(criteria?: Partial<T>): Promise<number>;
  exists(criteria: Partial<T>): Promise<boolean>;
}

/**
 * Query Options for repository operations
 */
export interface QueryOptions {
  limit?: number;
  skip?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Extended Repository Interface with query options
 */
export interface IExtendedRepository<T, TId = string> extends IRepository<T, TId> {
  findWithOptions(criteria: Partial<T>, options?: QueryOptions): Promise<T[]>;
  findAllWithOptions(options?: QueryOptions): Promise<T[]>;
}

/**
 * Repository Result Type for operations that may fail
 */
export type RepositoryResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: string;
};

/**
 * Transaction Interface for operations that need to be atomic
 */
export interface ITransactionalRepository<T, TId = string> extends IRepository<T, TId> {
  withTransaction<R>(operation: (repo: IRepository<T, TId>) => Promise<R>): Promise<R>;
}
