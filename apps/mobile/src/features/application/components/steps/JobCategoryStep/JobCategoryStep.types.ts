export interface JobCategory {
  _id: string;
  name: string;
  colorCode: string;
  requireOrientation: string;
}

export interface JobCategoryStepProps {
  value: string | null;
  onChange: (categoryId: string) => void;
  categories?: JobCategory[];
  isLoading?: boolean;
}
