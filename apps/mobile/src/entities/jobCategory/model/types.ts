import { Id } from '@backend/convex/_generated/dataModel';

export interface JobCategory {
  _id: Id<'jobCategories'>;
  _creationTime: number;
  name: string;
  description?: string;
  colorCode: string;
  requireOrientation: boolean | string; // Can be boolean or string ('yes'/'no') depending on backend
  requirements?: string[];
  isActive?: boolean; // Optional for compatibility with cache manager
}

export interface JobCategoryRequirement {
  _id: string; // Changed from Id<'requirements'> as 'requirements' is not a valid table
  _creationTime: number;
  jobCategoryId: Id<'jobCategories'>;
  fieldName: string;
  fieldIdentifier: string;
  displayName: string;
  description?: string;
  required: boolean;
  order: number;
}
