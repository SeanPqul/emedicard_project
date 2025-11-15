// convex/labFindings/referenceData.ts
// Reference data for lab test findings
// These are the dropdown options admins can choose from when recording findings

export const LAB_FINDING_OPTIONS = {
  urinalysis: [
    "WBC elevated – Cleared post-Rx",
    "RBC elevated – Cleared post-Rx",
    "Protein detected – Cleared post-Rx",
    "Glucose detected – Cleared post-Rx",
    "Bacteria present – Cleared post-Rx",
    "Crystals present – Cleared post-Rx",
    "pH abnormal – Cleared post-Rx",
    "Specific gravity abnormal – Cleared post-Rx",
    "Other urinalysis finding – Cleared",
  ],
  
  xray_sputum: [
    "Chest X-ray abnormal – TB ruled out, Cleared",
    "Chest X-ray abnormal – Pneumonia cleared",
    "Sputum positive – TB ruled out post-treatment",
    "Lung infiltrates – Cleared post-treatment",
    "Pleural effusion – Resolved",
    "Bronchitis – Cleared post-Rx",
    "Other chest finding – Cleared",
  ],
  
  stool: [
    "Parasite detected – Cleared post-Rx",
    "Ova detected – Cleared post-Rx",
    "Blood in stool – Cleared post-investigation",
    "Bacteria detected – Cleared post-Rx",
    "Amoeba detected – Cleared post-treatment",
    "Giardia detected – Cleared post-Rx",
    "Other stool finding – Cleared",
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
