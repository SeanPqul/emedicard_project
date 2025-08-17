import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

type ConvexId<T extends string> = Id<T>;

export function useJobCategories() {
  const allJobCategories = useQuery(api.jobCategories.getAllJobCategories.getAllJobCategoriesQuery, {});

  const createJobCategoryMutation = useMutation(api.jobCategories.createJobCategory.createJobCategoryMutation);
  const updateJobCategoryMutation = useMutation(api.jobCategories.updateJobCategory.updateJobCategoryMutation);
  const deleteJobCategoryMutation = useMutation(api.jobCategories.deleteJobCategory.deleteJobCategoryMutation);

  const createJobCategory = async (input: {
    name: string;
    colorCode: string;
    requireOrientation: boolean;
    description?: string;
    requirements?: string[];
  }) => {
    return createJobCategoryMutation(input);
  };

  const updateJobCategory = async (jobCategoryId: ConvexId<'jobCategory'>, updates: {
    name?: string;
    description?: string;
    requirements?: string[];
  }) => {
    return updateJobCategoryMutation({ categoryId: jobCategoryId, ...updates });
  };

  const deleteJobCategory = async (jobCategoryId: ConvexId<'jobCategory'>) => {
    return deleteJobCategoryMutation({ categoryId: jobCategoryId });
  };

  return {
    data: allJobCategories,
    isLoading: allJobCategories === undefined,
    
    service: jobCategoriesService,
    
    mutations: {
      createJobCategory,
      updateJobCategory,
      deleteJobCategory,
    }
  };
}