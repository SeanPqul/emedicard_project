import { useQuery, useMutation } from 'convex/react';
import { api } from 'backend/convex/_generated/api';
import { Id, TableNames } from 'backend/convex/_generated/dataModel';

type ConvexId<T extends TableNames> = Id<T>;

export function useJobCategories(selectedCategoryId?: string) {
  const allJobCategories = useQuery(api.jobCategories.getAllJobCategories.getAllJobCategoriesQuery);
  
  
  const requirementsByCategory = useQuery(
    api.requirements.getRequirementsByJobCategory.getRequirementsByJobCategoryQuery,
    selectedCategoryId ? { jobCategoryId: selectedCategoryId as ConvexId<'jobCategories'> } : 'skip'
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

  const updateJobCategory = async (jobCategoryId: ConvexId<'jobCategories'>, updates: {
    name?: string;
    description?: string;
    requirements?: string[];
  }) => {
    return updateJobCategoryMutation({ categoryId: jobCategoryId, ...updates });
  };

  const deleteJobCategory = async (jobCategoryId: ConvexId<'jobCategories'>) => {
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