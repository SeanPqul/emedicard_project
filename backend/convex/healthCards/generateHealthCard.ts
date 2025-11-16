// convex/healthCards/generateHealthCard.ts
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import { internalAction, internalMutation, internalQuery } from "../_generated/server";

/**
 * Generate health card HTML template
 * This will be converted to PDF on the client side or via external service
 */

// Signature references - using public URLs from Convex storage
const DOCTOR_SIGNATURE_URL = ""; // Will be set from storage query
const SANITATION_CHIEF_SIGNATURE_URL = ""; // Will be set from storage query

// Health Card Types based on Job Category
type CardType = 'yellow' | 'green' | 'pink';

// Color schemes for different card types
const CARD_COLORS = {
  yellow: {
    background: 'hsl(48, 95%, 88%)',    // Bright yellow
    border: 'hsl(45, 85%, 40%)',         // Dark yellow
    headerBg: 'hsl(48, 90%, 82%)',       // Slightly darker yellow
  },
  green: {
    background: 'hsl(145, 60%, 88%)',    // Light green
    border: 'hsl(145, 50%, 35%)',        // Dark green
    headerBg: 'hsl(145, 55%, 82%)',      // Slightly darker green
  },
  pink: {
    background: 'hsl(330, 70%, 92%)',    // Light pink
    border: 'hsl(330, 60%, 45%)',        // Dark pink
    headerBg: 'hsl(330, 65%, 86%)',      // Slightly darker pink
  },
};

/**
 * Classify health card type based on job category name
 * Yellow = Food Handlers
 * Green = Non-Food Workers
 * Pink = Skin-to-Skin Contact Workers
 */
function classifyCardType(jobCategoryName: string | undefined): CardType {
  if (!jobCategoryName) return 'yellow'; // Default to yellow
  
  const categoryLower = jobCategoryName.toLowerCase();
  
  // Pink Card - Skin-to-Skin Contact
  if (
    categoryLower.includes('pink') ||
    categoryLower.includes('skin') ||
    categoryLower.includes('contact') ||
    categoryLower.includes('massage') ||
    categoryLower.includes('barber') ||
    categoryLower.includes('salon') ||
    categoryLower.includes('spa') ||
    categoryLower.includes('beautician') ||
    categoryLower.includes('tattoo') ||
    categoryLower.includes('piercing')
  ) {
    return 'pink';
  }
  
  // Green Card - Non-Food
  if (
    categoryLower.includes('non-food') ||
    categoryLower.includes('nonfood') ||
    categoryLower.includes('green')
  ) {
    return 'green';
  }
  
  // Yellow Card - Food Handlers (default)
  // Includes: food, yellow, handler, restaurant, cafe, etc.
  return 'yellow';
}

function renderOptionalImg(url: string | undefined, className: string, alt: string) {
  if (!url) return "";
  return `<img class="${className}" src="${url}" alt="${alt}" />`;
}

function renderSignatureImg(url: string | undefined) {
  if (!url) return "";
  return `<img src="${url}" alt="Signature" />`;
}

// Helper: Format date for card display (MM/DD)
function formatCardDate(timestamp: number): string {
  const date = new Date(timestamp);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear().toString().slice(-2);
  return `${month}/${day}/${year}`;
}

// Helper: Render test section rows
function renderTestSection(findings: any[], maxRows: number = 2): string {
  let html = '';
  // Filter to only show unique findings (prevent duplicates)
  const uniqueFindings = findings.filter((finding, index, self) =>
    index === self.findIndex((f) => f.findingKind === finding.findingKind && f.testType === finding.testType)
  );
  
  for (let i = 0; i < maxRows; i++) {
    const finding = uniqueFindings[i];
    if (finding && finding.showOnCard) {
      // Truncate finding text if too long (max 50 characters)
      const truncatedFinding = finding.findingKind.length > 50 
        ? finding.findingKind.substring(0, 47) + '...' 
        : finding.findingKind;
      
      html += `
        <div class="table-row">
          <div class="table-cell">${formatCardDate(finding.clearedDate)}</div>
          <div class="table-cell finding-text">${truncatedFinding}</div>
          <div class="table-cell">${formatCardDate(finding.monitoringExpiry)}</div>
        </div>
      `;
    } else {
      html += `
        <div class="table-row">
          <div class="table-cell"></div>
          <div class="table-cell"></div>
          <div class="table-cell"></div>
        </div>
      `;
    }
  }
  return html;
}

function generateHealthCardHTML(data: {
  registrationNumber: string;
  fullName: string;
  occupation: string;
  age: number;
  sex: string;
  nationality: string;
  workplace: string;
  photoUrl?: string;
  qrCodeDataUrl: string;
  issuedDate: string;
  expiryDate: string;
  applicationId: string;
  doctorSignatureUrl?: string;
  sanitationChiefSignatureUrl?: string;
  // NEW: Dynamic official names and designations
  cityHealthOfficerName?: string;
  cityHealthOfficerDesignation?: string;
  sanitationChiefName?: string;
  sanitationChiefDesignation?: string;
  // Phase 2: Lab findings
  labFindings?: {
    urinalysis: any[];
    xray_sputum: any[];
    stool: any[];
  };
  // Phase 3: Card type for color coding
  cardType: CardType;
}): string {
  const colors = CARD_COLORS[data.cardType];
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Health Certificate - ${data.registrationNumber}</title>
  <style>
    @page {
      size: 280mm 90mm;
      margin: 0;
    }
    
    @media print {
      body { margin: 0; padding: 0; }
      .fold-container { box-shadow: none; page-break-after: avoid; }
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', 'Source Sans Pro', 'Arial', sans-serif;
      background: #e8e8e8;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
    }
    
    /* Fold Container - Side by Side */
    .fold-container {
      display: flex;
      box-shadow: 0 6px 20px rgba(0,0,0,0.15);
    }
    
    /* Health Certificate Card */
    .health-card {
      width: 320px;
      max-width: 320px;
      min-height: 448px;
      background: ${colors.background};
      border: 2px solid ${colors.border};
      border-right: 1px solid ${colors.border};
      padding: 14px;
    }
    
    .certificate-container {
      height: 100%;
      display: flex;
      flex-direction: column;
      color: hsl(0, 0%, 10%);
      font-size: 12px;
    }
    
    /* Header */
    .form-number {
      text-align: right;
      font-size: 10px;
      margin-bottom: 4px;
    }
    
    .header {
      position: relative;
      text-align: center;
      margin-bottom: 8px;
    }
    
    .header-qr {
      position: absolute;
      left: 0;
      top: 0;
      width: 50px;
      height: 50px;
    }
    
    .header-qr img {
      width: 100%;
      height: 100%;
    }
    
    .header-line1 {
      font-size: 10px;
      margin-bottom: 2px;
    }
    
    .header-line2 {
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 2px;
    }
    
    .header-line3 {
      font-size: 12px;
      margin-bottom: 4px;
    }
    
    .reg-number {
      font-size: 10px;
      text-align: center;
      margin-top: 4px;
    }
    
    .reg-number-value {
      font-weight: 600;
    }
    
    /* Title */
    .title {
      text-align: center;
      margin-bottom: 4px;
    }
    
    .title h1 {
      font-size: 14px;
      font-weight: bold;
      letter-spacing: 0.05em;
    }
    
    /* Legal Text */
    .legal-text {
      font-size: 9px;
      text-align: center;
      margin-bottom: 12px;
      line-height: 1.3;
    }
    
    /* Personal Information */
    .info-section {
      margin-bottom: 12px;
    }
    
    .info-row {
      display: flex;
      border-bottom: 1px solid ${colors.border};
      padding-bottom: 2px;
      margin-bottom: 4px;
    }
    
    .info-label {
      font-size: 10px;
      margin-right: 4px;
    }
    
    .info-value {
      font-size: 11px;
      font-weight: 600;
      flex: 1;
    }
    
    .info-row-multi {
      display: flex;
      border-bottom: 1px solid ${colors.border};
      padding-bottom: 2px;
      margin-bottom: 4px;
      gap: 16px;
    }
    
    .info-group {
      display: flex;
    }
    
    .info-group-flex {
      display: flex;
      flex: 1;
    }
    
    .workplace-row {
      display: flex;
      border-bottom: 1px solid ${colors.border};
      padding-bottom: 2px;
      margin-bottom: 4px;
    }
    
    .workplace-label {
      font-size: 10px;
      margin-right: 4px;
    }
    
    .workplace-value {
      font-size: 11px;
      font-weight: 600;
      flex: 1;
    }
    
    /* Photo and Signature Section */
    .bottom-section {
      display: flex;
      gap: 12px;
      margin-top: 6px;
    }
    
    .photo {
      width: 90px;
      height: 105px;
      border: 1px solid ${colors.border};
      background: white;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    
    .photo img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .photo-placeholder {
      font-size: 10px;
      color: hsl(0, 0%, 60%);
    }
    
    .signature-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    
    .signature-box {
      border-bottom: 1px solid ${colors.border};
      padding-bottom: 6px;
      margin-top: 8px;
    }
    
    .signature-placeholder {
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .signature-label {
      text-align: center;
      font-size: 10px;
      margin-top: 4px;
    }
    
    .signatory {
      text-align: center;
      position: relative;
    }

    .sanitation-signature {
      height: 30px;
      margin-bottom: -8px;
      margin-top: -3px;
      object-fit: contain;
    }
    
    .signatory-name {
      font-size: 10px;
      font-weight: 600;
      line-height: 1.2;
    }
    
    .signatory-title {
      font-size: 9px;
    }
    
    /* Bottom Official */
    .bottom-official {
      text-align: center;
      margin-top: 6px;
      padding-top: 6px;
      border-top: 1px solid ${colors.border};
      position: relative;
    }

    .doctor-signature {
      height: 30px;
      margin-bottom: -8px;
      margin-top: -3px;
      object-fit: contain;
    }
    
    .bottom-official-name {
      font-size: 11px;
      font-weight: 600;
      line-height: 1.2;
    }
    
    .bottom-official-title {
      font-size: 10px;
    }
    
    /* Back of Card Styles */
    .card-back {
      width: 320px;
      max-width: 320px;
      min-height: 448px;
      background: ${colors.background};
      border: 2px solid ${colors.border};
      border-left: 1px solid ${colors.border};
      padding: 14px;
    }
    
    .back-container {
      height: 100%;
      display: flex;
      flex-direction: column;
      color: hsl(0, 0%, 10%);
    }
    
    .important-header {
      text-align: center;
      margin-bottom: 10px;
    }
    
    .important-title {
      font-size: 13px;
      font-weight: bold;
      margin-bottom: 6px;
    }
    
    .important-text {
      font-size: 9px;
      line-height: 1.4;
      text-align: center;
    }
    
    .important-text p {
      margin-bottom: 3px;
    }
    
    .dates-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin: 8px 0 10px;
    }
    
    .date-box {
      text-align: center;
      border: 1px solid ${colors.border};
      padding: 6px 4px;
    }
    
    .date-value {
      font-size: 12px;
      font-weight: bold;
      margin-bottom: 2px;
    }
    
    .date-label {
      font-size: 9px;
    }
    
    .test-section {
      margin-bottom: 6px;
    }
    
    .test-title {
      text-align: center;
      font-size: 10px;
      font-weight: 600;
      margin-bottom: 3px;
    }
    
    .test-table {
      border: 1px solid ${colors.border};
    }
    
    .table-header {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      border-bottom: 1px solid ${colors.border};
      background: ${colors.headerBg};
    }
    
    .table-header-cell {
      font-size: 9px;
      font-weight: 600;
      text-align: center;
      padding: 3px;
      border-right: 1px solid ${colors.border};
    }
    
    .table-header-cell:last-child {
      border-right: none;
    }
    
    .table-row {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      border-bottom: 1px solid ${colors.border};
    }
    
    .table-row:last-child {
      border-bottom: none;
    }
    
    .table-cell {
      font-size: 9px;
      text-align: center;
      padding: 3px 1px;
      border-right: 1px solid ${colors.border};
      min-height: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .table-cell:last-child {
      border-right: none;
    }
    
    /* Special styling for finding text (middle column) */
    .table-cell.finding-text {
      font-size: 6.5px;
      line-height: 1.15;
      padding: 2px 1px;
      word-wrap: break-word;
      overflow-wrap: break-word;
      hyphens: auto;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    
    .serial-number {
      margin-top: auto;
      padding-top: 8px;
      text-align: center;
      font-size: 10px;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="fold-container">
    <!-- Front of Certificate -->
    <div class="health-card">
    <div class="certificate-container">
      <!-- Header -->
      <div class="form-number">EHS Form No. 102-A</div>
      
      <div class="header">
        <div class="header-qr">
          <img src="${data.qrCodeDataUrl}" alt="QR Code" />
        </div>
        <div class="header-line1">REPUBLIC of the PHILIPPINES</div>
        <div class="header-line2">CITY HEALTH OFFICE</div>
        <div class="header-line3">Davao City</div>
        <div class="reg-number">Reg. No. <span class="reg-number-value">${data.registrationNumber}</span></div>
      </div>

      <!-- Title -->
      <div class="title">
        <h1>HEALTH CERTIFICATE</h1>
      </div>

      <!-- Legal Text -->
      <div class="legal-text">
        Pursuant to the provision of P.D. 522,<br />
        P.D. 856, and City Ord. No. 078, s. 2000<br />
        this certificate is issued for
      </div>

      <!-- Personal Information -->
      <div class="info-section">
        <div class="info-row">
          <span class="info-label">Name:</span>
          <span class="info-value">${data.fullName}</span>
        </div>
        
        <div class="info-row">
          <span class="info-label">Occupation:</span>
          <span class="info-value">${data.occupation}</span>
        </div>
        
        <div class="info-row-multi">
          <div class="info-group">
            <span class="info-label">Age:</span>
            <span class="info-value">${data.age}</span>
          </div>
          <div class="info-group">
            <span class="info-label">Sex:</span>
            <span class="info-value">${data.sex}</span>
          </div>
          <div class="info-group-flex">
            <span class="info-label">Nationality:</span>
            <span class="info-value">${data.nationality}</span>
          </div>
        </div>
        
        <div class="workplace-row">
          <span class="workplace-label">Workplace:</span>
          <span class="workplace-value">${data.workplace}</span>
        </div>
      </div>

      <!-- Photo and Signature Section -->
      <div class="bottom-section">
        <!-- Photo -->
        <div class="photo">
          ${data.photoUrl 
            ? `<img src="${data.photoUrl}" alt="Certificate holder" />` 
            : '<div class="photo-placeholder">Photo</div>'
          }
        </div>

        <!-- Signature Area -->
        <div class="signature-area">
          <div class="signature-box">
            <div class="signature-placeholder"></div>
            <div class="signature-label">Signature</div>
          </div>
          
          <div class="signatory">
            ${renderOptionalImg(
              data.sanitationChiefSignatureUrl,
              "sanitation-signature",
              `Signature of ${data.sanitationChiefName || 'Luzminda N. Paig'}`
            )}
            <div class="signatory-name">${data.sanitationChiefName || 'Luzminda N. Paig'}</div>
            <div class="signatory-title">${data.sanitationChiefDesignation || 'Sanitation Chief'}</div>
          </div>
        </div>
      </div>

      <!-- Bottom Official -->
      <div class="bottom-official">
        ${renderOptionalImg(
          data.doctorSignatureUrl,
          "doctor-signature",
          `Signature of ${data.cityHealthOfficerName || 'Dr. Marjorie D. Culas'}`
        )}
        <div class="bottom-official-name">${data.cityHealthOfficerName || 'Dr. Marjorie D. Culas'}</div>
        <div class="bottom-official-title">${data.cityHealthOfficerDesignation || 'City Health Officer'}</div>
      </div>
    </div>
    </div>
    
    <!-- Back of Certificate -->
    <div class="card-back">
    <div class="back-container">
      <!-- Important Header -->
      <div class="important-header">
        <h2 class="important-title">IMPORTANT</h2>
        <div class="important-text">
          <p>This HEALTH CERTIFICATE is non-transferable.</p>
          <p>Always wear your certificate in the upper left side front portion of your garment while working.</p>
          <p>Valid only until the next date of examination as indicated below.</p>
        </div>
      </div>
      
      <!-- Dates Section -->
      <div class="dates-section">
        <div class="date-box">
          <div class="date-value">${data.issuedDate}</div>
          <div class="date-label">Date of Issuance</div>
        </div>
        <div class="date-box">
          <div class="date-value">${data.expiryDate}</div>
          <div class="date-label">Date of Expiration</div>
        </div>
      </div>
      
      <!-- URINALYSIS Section -->
      <div class="test-section">
        <div class="test-title">URINALYSIS</div>
        <div class="test-table">
          <div class="table-header">
            <div class="table-header-cell">Date</div>
            <div class="table-header-cell">Kind</div>
            <div class="table-header-cell">Exp Date</div>
          </div>
          ${renderTestSection(data.labFindings?.urinalysis || [], 2)}
        </div>
      </div>
      
      <!-- X-RAY / SPUTUM Section -->
      <div class="test-section">
        <div class="test-title">X-RAY / SPUTUM</div>
        <div class="test-table">
          <div class="table-header">
            <div class="table-header-cell">Date</div>
            <div class="table-header-cell">Kind</div>
            <div class="table-header-cell">Exp Date</div>
          </div>
          ${renderTestSection(data.labFindings?.xray_sputum || [], 2)}
        </div>
      </div>
      
      <!-- STOOL Section -->
      <div class="test-section">
        <div class="test-title">STOOL</div>
        <div class="test-table">
          <div class="table-header">
            <div class="table-header-cell">Date</div>
            <div class="table-header-cell">Kind</div>
            <div class="table-header-cell">Exp Date</div>
          </div>
          ${renderTestSection(data.labFindings?.stool || [], 2)}
        </div>
      </div>
      
      <!-- Serial Number -->
      <div class="serial-number">${data.registrationNumber}</div>
    </div>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generate registration number
 * Format: XXXXXX-YY (6 digits + year)
 */
function generateRegistrationNumber(count: number): string {
  const year = new Date().getFullYear().toString().slice(-2);
  const number = (count + 1).toString().padStart(6, '0');
  return `${number}-${year}`;
}

/**
 * Calculate age from date of birth
 */
function calculateAge(dateOfBirth: number): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}


/**
 * Generate health card for approved application
 */
export const generateHealthCard = internalAction({
  args: {
    applicationId: v.id("applications"),
  },
  handler: async (ctx, args): Promise<{ success: boolean; healthCardId: any; registrationNumber: string; htmlContent: string; }> => {
    // NEW: Fetch current officials from systemConfig
    let doctorSignatureUrl: string | undefined;
    let sanitationChiefSignatureUrl: string | undefined;
    let cityHealthOfficer: any = null;
    let sanitationChief: any = null;

    // Try to fetch officials from systemConfig first (new system)
    try {
      const officials = await ctx.runQuery(internal.healthCards.generateHealthCard.getActiveOfficialsForCard, {});
      
      if (officials.cityHealthOfficer) {
        cityHealthOfficer = officials.cityHealthOfficer;
        doctorSignatureUrl = officials.cityHealthOfficer.signatureUrl;
      }
      
      if (officials.sanitationChief) {
        sanitationChief = officials.sanitationChief;
        sanitationChiefSignatureUrl = officials.sanitationChief.signatureUrl;
      }
    } catch (error) {
      console.error("Error fetching officials from systemConfig:", error);
      
      // FALLBACK: Try old signatures table for backward compatibility
      try {
        const signatures = await ctx.runQuery(internal.healthCards.generateHealthCard.getSignatureUrls, {});
        if (signatures.doctorUrl) {
          doctorSignatureUrl = signatures.doctorUrl;
          // Use hardcoded names as fallback
          cityHealthOfficer = {
            name: "Dr. Marjorie D. Culas",
            designation: "City Health Officer",
            signatureUrl: signatures.doctorUrl,
          };
        }
        if (signatures.sanitationChiefUrl) {
          sanitationChiefSignatureUrl = signatures.sanitationChiefUrl;
          sanitationChief = {
            name: "Luzminda N. Paig",
            designation: "Sanitation Chief",
            signatureUrl: signatures.sanitationChiefUrl,
          };
        }
      } catch (fallbackError) {
        console.error("Error fetching fallback signatures:", fallbackError);
      }
    }

    // Get application data
    const application = await ctx.runQuery(internal.healthCards.generateHealthCard.getApplicationData, {
      applicationId: args.applicationId,
    });

    if (!application) {
      throw new Error("Application not found");
    }

    if (application.applicationStatus !== "Approved") {
      throw new Error("Application must be approved before generating health card");
    }

    // Get total count of issued cards for registration number
    const cardCount = await ctx.runQuery(internal.healthCards.generateHealthCard.getHealthCardCount, {});

    // Generate registration number
    const registrationNumber = generateRegistrationNumber(cardCount);

    // Calculate dates
    const issuedDate = new Date();
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1); // Valid for 1 year

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    // application.dateOfBirth is already the calculated age from getApplicationData
    const age = application.dateOfBirth || 18;

    // Generate QR code as data URL using an external service
    const qrCodeData = `https://emedicard.davao.gov.ph/verify/${registrationNumber}`;
    const qrCodeDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrCodeData)}`;

    // Phase 2: Fetch lab findings for this application
    let labFindings: any = { urinalysis: [], xray_sputum: [], stool: [] };
    try {
      labFindings = await ctx.runQuery(internal.labFindings.index.getLabFindingsInternal, {
        applicationId: args.applicationId,
      });
    } catch (error) {
      console.log("No lab findings found or error fetching:", error);
      // Continue with empty findings - most applications won't have any
    }
    
    // Phase 3: Classify card type based on job category
    const cardType = classifyCardType(application.jobCategoryName);
    console.log(`Health card type classified as: ${cardType} for job category: ${application.jobCategoryName}`);

    // Phase 4: Dynamic instructor name for YELLOW cards only (food handlers)
    // Get the orientation instructor who conducted the food safety training
    // Green/Pink cards keep the configured sanitation chief name
    if (cardType === 'yellow') {
      console.log(`[DEBUG] Yellow card detected, fetching orientation instructor for application ${args.applicationId}`);
      try {
        const instructor = await ctx.runQuery(internal.healthCards.generateHealthCard.getOrientationInstructor, {
          applicationId: args.applicationId,
        });
        
        console.log(`[DEBUG] Orientation instructor result:`, instructor);
        
        if (instructor) {
          // Override sanitation chief with actual orientation instructor for yellow cards
          sanitationChief = {
            name: instructor.name,
            designation: instructor.designation,
            signatureUrl: sanitationChiefSignatureUrl,
            configId: sanitationChief?.configId,
          };
          console.log(`✅ Yellow card: Using orientation instructor ${instructor.name} (${instructor.designation})`);
        } else {
          console.log(`⚠️ Yellow card: No orientation instructor found, using default sanitation chief ${sanitationChief?.name}`);
        }
      } catch (error) {
        console.error("❌ Error fetching orientation instructor for yellow card:", error);
        // Fall back to default sanitation chief if error
      }
    } else {
      console.log(`${cardType} card: Using default sanitation chief ${sanitationChief?.name || 'Luzminda N. Paig'}`);
    }

    // Generate HTML with dynamic official names, lab findings, and card type
    const htmlContent = generateHealthCardHTML({
      registrationNumber,
      fullName: application.fullName,
      occupation: application.occupation,
      age,
      sex: application.sex || 'N/A',
      nationality: application.nationality || 'Filipino',
      workplace: application.workplace || 'N/A',
      photoUrl: application.photoUrl,
      qrCodeDataUrl,
      issuedDate: formatDate(issuedDate),
      expiryDate: formatDate(expiryDate),
      applicationId: args.applicationId,
      doctorSignatureUrl,
      sanitationChiefSignatureUrl,
      // NEW: Pass dynamic official names
      cityHealthOfficerName: cityHealthOfficer?.name,
      cityHealthOfficerDesignation: cityHealthOfficer?.designation,
      sanitationChiefName: sanitationChief?.name,
      sanitationChiefDesignation: sanitationChief?.designation,
      // Phase 2: Pass lab findings
      labFindings,
      // Phase 3: Pass card type for color coding
      cardType,
    });

    // Prepare signedBy snapshot for health card record
    const signedBySnapshot = {
      cityHealthOfficer: cityHealthOfficer
        ? {
            name: cityHealthOfficer.name,
            designation: cityHealthOfficer.designation,
            signatureUrl: doctorSignatureUrl,
            configId: cityHealthOfficer.configId,
          }
        : {
            name: "Dr. Marjorie D. Culas",
            designation: "City Health Officer",
            signatureUrl: doctorSignatureUrl,
            configId: undefined,
          },
      sanitationChief: sanitationChief
        ? {
            name: sanitationChief.name,
            designation: sanitationChief.designation,
            signatureUrl: sanitationChiefSignatureUrl,
            configId: sanitationChief.configId,
          }
        : {
            name: "Luzminda N. Paig",
            designation: "Sanitation Chief",
            signatureUrl: sanitationChiefSignatureUrl,
            configId: undefined,
          },
    };

    // Phase 2: Collect finding IDs from all types
    const allFindings = [
      ...(labFindings.urinalysis || []),
      ...(labFindings.xray_sputum || []),
      ...(labFindings.stool || []),
    ];
    
    const findingIds = allFindings
      .filter((f: any) => f.showOnCard)
      .map((f: any) => f._id);

    // Store health card record with signedBy snapshot, findings, and card type
    const healthCardId: any = await ctx.runMutation(internal.healthCards.generateHealthCard.createHealthCardRecord, {
      applicationId: args.applicationId,
      registrationNumber,
      htmlContent,
      issuedDate: issuedDate.getTime(),
      expiryDate: expiryDate.getTime(),
      signedBy: signedBySnapshot,
      includedFindings: findingIds.length > 0 ? findingIds : undefined,
      cardType, // Phase 3: Store card type
    });

    // Phase 2: Link findings back to the generated health card
    for (const finding of allFindings) {
      try {
        await ctx.runMutation(internal.labFindings.index.linkFindingToCard, {
          findingId: finding._id,
          healthCardId,
        });
      } catch (error) {
        console.error(`Error linking finding ${finding._id} to card:`, error);
      }
    }

    // Update application with health card reference
    await ctx.runMutation(internal.healthCards.generateHealthCard.updateApplicationWithHealthCard, {
      applicationId: args.applicationId,
      healthCardId,
      registrationNumber,
    });

    return {
      success: true,
      healthCardId,
      registrationNumber,
      htmlContent,
    };
  },
});

/**
 * Internal query to get active officials from systemConfig (NEW SYSTEM)
 */
export const getActiveOfficialsForCard = internalQuery({
  args: {},
  handler: async (ctx) => {
    // Query active officials from systemConfig
    const cityHealthOfficer = await ctx.db
      .query("systemConfig")
      .withIndex("by_key", (q) => q.eq("key", "city_health_officer"))
      .filter((q) => q.eq(q.field("value.isActive"), true))
      .first();

    const sanitationChief = await ctx.db
      .query("systemConfig")
      .withIndex("by_key", (q) => q.eq("key", "sanitation_chief"))
      .filter((q) => q.eq(q.field("value.isActive"), true))
      .first();

    // Get signature URLs from storage if available
    let cityHealthOfficerSignatureUrl: string | undefined;
    let sanitationChiefSignatureUrl: string | undefined;

    if (cityHealthOfficer?.value.signatureStorageId) {
      cityHealthOfficerSignatureUrl =
        (await ctx.storage.getUrl(cityHealthOfficer.value.signatureStorageId)) ?? undefined;
    }

    if (sanitationChief?.value.signatureStorageId) {
      sanitationChiefSignatureUrl =
        (await ctx.storage.getUrl(sanitationChief.value.signatureStorageId)) ?? undefined;
    }

    return {
      cityHealthOfficer: cityHealthOfficer
        ? {
            name: cityHealthOfficer.value.name,
            designation: cityHealthOfficer.value.designation,
            signatureUrl: cityHealthOfficerSignatureUrl,
            configId: cityHealthOfficer._id,
          }
        : null,
      sanitationChief: sanitationChief
        ? {
            name: sanitationChief.value.name,
            designation: sanitationChief.value.designation,
            signatureUrl: sanitationChiefSignatureUrl,
            configId: sanitationChief._id,
          }
        : null,
    };
  },
});

/**
 * Internal query to get signature URLs from signatures table (DEPRECATED - for backward compatibility)
 */
export const getSignatureUrls = internalQuery({
  args: {},
  handler: async (ctx) => {
    const signatures = await ctx.db.query("signatures").collect();
    
    let doctorUrl: string | undefined;
    let sanitationChiefUrl: string | undefined;
    
    for (const sig of signatures) {
      const url = await ctx.storage.getUrl(sig.storageId);
      if (sig.type === "doctor") {
        doctorUrl = url ?? undefined;
      } else if (sig.type === "sanitation_chief") {
        sanitationChiefUrl = url ?? undefined;
      }
    }
    
    return { doctorUrl, sanitationChiefUrl };
  },
});

/**
 * Internal query to get orientation instructor for food handler applications
 * Returns the inspector who conducted the orientation (stored in orientationBookings)
 */
export const getOrientationInstructor = internalQuery({
  args: {
    applicationId: v.id("applications"),
  },
  handler: async (ctx, args) => {
    console.log(`[getOrientationInstructor] Fetching for application:`, args.applicationId);
    
    // Get the orientation booking for this application
    const booking = await ctx.db
      .query("orientationBookings")
      .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId))
      .filter((q) => q.eq(q.field("status"), "completed"))
      .first();
    
    console.log(`[getOrientationInstructor] Orientation booking:`, {
      found: !!booking,
      instructor: booking?.instructor,
      status: booking?.status
    });
    
    if (!booking?.instructor) {
      console.log(`[getOrientationInstructor] No orientation instructor found`);
      return null;
    }

    console.log(`[getOrientationInstructor] Returning instructor:`, {
      name: booking.instructor.name,
      designation: booking.instructor.designation
    });

    return {
      name: booking.instructor.name,
      designation: booking.instructor.designation,
    };
  },
});

/**
 * Internal query to get application data for health card generation
 */
export const getApplicationData = internalQuery({
  args: {
    applicationId: v.id("applications"),
  },
  handler: async (ctx, args) => {
    const application = await ctx.db.get(args.applicationId);
    if (!application) return null;

    const user = await ctx.db.get(application.userId);
    if (!user) return null;

    const jobCategory = await ctx.db.get(application.jobCategoryId);

    // Get user photo from documentUploads (validId or photo2x2)
    const documents = await ctx.db
      .query("documentUploads")
      .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId))
      .collect();

    let photoUrl: string | undefined;
    // Note: documentUploads have storageFileId field
    // We need to get the URL from storage for photo documents
    // Look for photo2x2 or validId documents by checking documentType
    const photoDoc = documents[0]; // Get first document as fallback
    
    if (photoDoc?.storageFileId) {
      const url = await ctx.storage.getUrl(photoDoc.storageFileId);
      photoUrl = url ?? undefined;
    }

    // Build full name from application or user
    const fullName = application.firstName && application.lastName
      ? `${application.firstName} ${application.middleName ? application.middleName + ' ' : ''}${application.lastName}`.trim()
      : user.fullname;

    // Calculate age from birthDate string (format: YYYY-MM-DD or ISO string)
    let calculatedAge = application.age || 18;
    if (user.birthDate) {
      try {
        const birthDate = new Date(user.birthDate);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        if (!isNaN(age) && age > 0 && age < 120) {
          calculatedAge = age;
        }
      } catch (e) {
        console.error('Error calculating age:', e);
      }
    }

    return {
      applicationStatus: application.applicationStatus,
      fullName,
      occupation: application.position || jobCategory?.name || 'Service Crew',
      dateOfBirth: calculatedAge, // Return age directly, not timestamp
      sex: user.gender || application.gender || 'N/A',
      nationality: application.nationality || 'Filipino',
      workplace: application.organization || 'N/A',
      photoUrl: photoUrl || undefined,
      jobCategoryName: jobCategory?.name, // NEW: For card type classification
    };
  },
});

/**
 * Internal query to get health card count
 */
export const getHealthCardCount = internalQuery({
  args: {},
  handler: async (ctx) => {
    const cards = await ctx.db.query("healthCards").collect();
    return cards.length;
  },
});

/**
 * Internal mutation to create health card record
 */
export const createHealthCardRecord = internalMutation({
  args: {
    applicationId: v.id("applications"),
    registrationNumber: v.string(),
    htmlContent: v.string(),
    issuedDate: v.float64(),
    expiryDate: v.float64(),
    signedBy: v.optional(v.object({
      cityHealthOfficer: v.object({
        name: v.string(),
        designation: v.string(),
        signatureUrl: v.optional(v.string()),
        configId: v.optional(v.id("systemConfig")),
      }),
      sanitationChief: v.object({
        name: v.string(),
        designation: v.string(),
        signatureUrl: v.optional(v.string()),
        configId: v.optional(v.id("systemConfig")),
      }),
    })),
    // Phase 2: Lab findings
    includedFindings: v.optional(v.array(v.id("labTestFindings"))),
    // Phase 3: Card type
    cardType: v.optional(v.union(v.literal("yellow"), v.literal("green"), v.literal("pink"))),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("healthCards", {
      applicationId: args.applicationId,
      registrationNumber: args.registrationNumber,
      htmlContent: args.htmlContent,
      issuedDate: args.issuedDate,
      expiryDate: args.expiryDate,
      status: "active",
      createdAt: Date.now(),
      signedBy: args.signedBy, // Store snapshot of officials
      includedFindings: args.includedFindings, // Phase 2: Store findings IDs
      cardType: args.cardType, // Phase 3: Store card type for reference
    });
  },
});

/**
 * Internal mutation to update application with health card reference
 */
export const updateApplicationWithHealthCard = internalMutation({
  args: {
    applicationId: v.id("applications"),
    healthCardId: v.id("healthCards"),
    registrationNumber: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.applicationId, {
      healthCardId: args.healthCardId,
      healthCardRegistrationNumber: args.registrationNumber,
      healthCardIssuedAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});
