import { DocumentRequirement } from '../../types/domain/application';

export const transformRequirements = (reqs: any[], jobCategoryId: string): DocumentRequirement[] => {
  if (!reqs || !Array.isArray(reqs)) {
    return [];
  }

  try {
    return reqs.map((req: any) => ({
      _id: req._id,
      jobCategoryId: req.jobCategory?._id || jobCategoryId,
      name: req.documentType?.name || 'Unknown Document',
      description: req.documentType?.description || 'Required document',
      icon: req.documentType?.icon || 'document',
      required: req.isRequired || false,
      fieldName: req.documentType?.fieldIdentifier || req._id,
      formats: ['jpg', 'png', 'pdf'] // Default formats
    }));
  } catch (error) {
    console.error('Error transforming requirements:', error);
    return [];
  }
};