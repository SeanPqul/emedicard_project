import { Id } from 'backend/convex/_generated/dataModel';

export interface JobCategory {
  _id: Id<'jobCategories'>;
  _creationTime: number;
  name: string;
  description?: string;
  colorCode: string;
  requireOrientation: boolean;
  requirements?: string[];
}

export interface JobCategoryRequirement {
  _id: Id<'requirements'>;
  _creationTime: number;
  jobCategoryId: Id<'jobCategories'>;
  fieldName: string;
  fieldIdentifier: string;
  displayName: string;
  description?: string;
  required: boolean;
  order: number;
}
