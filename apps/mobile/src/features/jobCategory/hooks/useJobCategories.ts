import { useQuery, useMutation } from 'convex/react';
import { api } from '@backend/convex/_generated/api';
import { Id } from '@backend/convex/_generated/dataModel';
import { JobCategory } from '@/src/entities/jobCategory/model/types';

export function useJobCategories(selectedCategoryId?: string) {
  const rawJobCategories = useQuery(api.jobCategories.getAllJobCategories.getAllJobCategoriesQuery);
  
  // Transform the data to ensure requireOrientation is always a boolean
  const allJobCategories = rawJobCategories?.map(category => ({
    ...category,
    requireOrientation: typeof category.requireOrientation === 'string' 
      ? category.requireOrientation === 'yes' 
      : !!category.requireOrientation
  })) as JobCategory[] | undefined;
  
  
  const requirementsByCategory = useQuery(
    api.requirements.getRequirementsByJobCategory.getRequirementsByJobCategoryQuery,
    selectedCategoryId ? { jobCategoryId: selectedCategoryId as Id<'jobCategories'> } : 'skip'
  );

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

  const updateJobCategory = async (jobCategoryId: Id<'jobCategories'>, updates: {
    name?: string;
    description?: string;
    requirements?: string[];
  }) => {
    return updateJobCategoryMutation({ categoryId: jobCategoryId, ...updates });
  };

  const deleteJobCategory = async (jobCategoryId: Id<'jobCategories'>) => {
    return deleteJobCategoryMutation({ categoryId: jobCategoryId });
  };

  return {
    jobCategories: allJobCategories,
    requirementsByCategory,
    isLoading: allJobCategories === undefined,
    isLoadingRequirements: requirementsByCategory === undefined,
    
    mutations: {
      createJobCategory,
      updateJobCategory,
      deleteJobCategory,
    }
  };
}