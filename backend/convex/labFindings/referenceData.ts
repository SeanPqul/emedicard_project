// convex/labFindings/referenceData.ts
// Reference data for lab test findings
// These are the dropdown options admins can choose from when recording findings

export const LAB_FINDING_OPTIONS = {
  urinalysis: [
    "WBC elevated",
    "RBC elevated",
    "Protein detected ",
    "Glucose detected",
    "Bacteria present",
    "Crystals present",
    "pH abnormal",
    "Specific gravity abnormal",
    "Other urinalysis finding",
  ],
  
  xray_sputum: [
    "Chest X-ray abnormal",
    "Chest X-ray abnormal",
    "Sputum positive",
    "Lung infiltrates",
    "Pleural effusion ",
    "Bronchitis",
    "Other chest finding",
  ],
  
  stool: [
    "Parasite detected",
    "Ova detected",
    "Blood in stool",
    "Bacteria detected",
    "Amoeba detected",
    "Giardia detected",
    "Other stool finding",
  ],
} as const;

// Monitoring period recommendations based on finding type
export const MONITORING_PERIOD_RECOMMENDATIONS = {
  urinalysis: 6, // months - standard for urinary tract monitoring
  xray_sputum: 12, // months - longer for chest/TB monitoring
  stool: 3, // months - shorter for parasitic monitoring
} as const;

// Finding status descriptions for UI
export const FINDING_STATUS_LABELS = {
  cleared_with_monitoring: "Cleared - Needs Monitoring",
  cleared_no_monitoring: "Cleared - No Further Monitoring",
  pending_retest: "Pending Retest",
} as const;

// Test type labels for UI
export const TEST_TYPE_LABELS = {
  urinalysis: "Urinalysis",
  xray_sputum: "X-Ray / Sputum",
  stool: "Stool Examination",
} as const;
