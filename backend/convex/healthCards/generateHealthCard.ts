// convex/healthCards/generateHealthCard.ts
import { v } from "convex/values";
import { internalAction, internalMutation, internalQuery } from "../_generated/server";
import { internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";

/**
 * Generate health card HTML template
 * This will be converted to PDF on the client side or via external service
 */
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
}): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Health Certificate - ${data.registrationNumber}</title>
  <style>
    @page {
      size: 140mm 90mm;
      margin: 0;
    }
    
    @media print {
      body { margin: 0; padding: 0; }
      .health-card { box-shadow: none; page-break-after: avoid; }
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
    
    /* Health Certificate Card */
    .health-card {
      width: 320px;
      max-width: 320px;
      aspect-ratio: 2.5 / 3.5;
      background: hsl(40, 30%, 94%);
      border: 2px solid hsl(0, 0%, 20%);
      padding: 16px;
      box-shadow: 0 6px 20px rgba(0,0,0,0.15);
      margin: 0 auto;
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
      text-align: center;
      margin-bottom: 8px;
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
      border-bottom: 1px solid hsl(0, 0%, 20%);
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
      border-bottom: 1px solid hsl(0, 0%, 20%);
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
      border-bottom: 1px solid hsl(0, 0%, 20%);
      padding-bottom: 2px;
      margin-bottom: 4px;
    }
    
    .workplace-label {
      font-size: 10px;
    }
    
    .workplace-value {
      font-size: 11px;
      font-weight: 600;
      margin-left: 16px;
    }
    
    /* Photo and Signature Section */
    .bottom-section {
      display: flex;
      gap: 12px;
      flex: 1;
    }
    
    .photo {
      width: 96px;
      height: 112px;
      border: 1px solid hsl(0, 0%, 20%);
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
      border-bottom: 1px solid hsl(0, 0%, 20%);
      padding-bottom: 8px;
      margin-top: 16px;
    }
    
    .signature-placeholder {
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-family: cursive;
    }
    
    .signature-label {
      text-align: center;
      font-size: 10px;
      margin-top: 4px;
    }
    
    .signatory {
      text-align: center;
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
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid hsl(0, 0%, 20%);
    }
    
    .bottom-official-name {
      font-size: 11px;
      font-weight: 600;
      line-height: 1.2;
    }
    
    .bottom-official-title {
      font-size: 10px;
    }
  </style>
</head>
<body>
  <div class="health-card">
    <div class="certificate-container">
      <!-- Header -->
      <div class="form-number">EHS Form No. 102-A</div>
      
      <div class="header">
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
          <div class="workplace-label">Workplace:</div>
          <div class="workplace-value">${data.workplace}</div>
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
            <div class="signature-placeholder">A.S.</div>
            <div class="signature-label">Signature</div>
          </div>
          
          <div class="signatory">
            <div class="signatory-name">Luzminda N. Paig</div>
            <div class="signatory-title">Sanitation Chief</div>
          </div>
        </div>
      </div>

      <!-- Bottom Official -->
      <div class="bottom-official">
        <div class="bottom-official-name">Dr. Marjorie D. Culas</div>
        <div class="bottom-official-title">City Health Officer</div>
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

    // Generate HTML
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
    });

    // Store health card record
    const healthCardId: any = await ctx.runMutation(internal.healthCards.generateHealthCard.createHealthCardRecord, {
      applicationId: args.applicationId,
      registrationNumber,
      htmlContent,
      issuedDate: issuedDate.getTime(),
      expiryDate: expiryDate.getTime(),
    });

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
