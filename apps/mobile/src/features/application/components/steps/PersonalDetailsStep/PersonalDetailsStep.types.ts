export interface PersonalDetails {
  position: string;
  organization: string;
  civilStatus: string;
}

export interface PersonalDetailsStepProps {
  value: PersonalDetails;
  onChange: (details: PersonalDetails) => void;
  errors?: Partial<PersonalDetails>;
}
