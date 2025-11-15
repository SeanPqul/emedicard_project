# Mermaid Diagram Files - Ready for mermaid.live

This folder contains all sequence diagrams extracted from `CAPSTONE_SEQUENCE_DIAGRAMS.md` in pure Mermaid format, ready to copy/paste into **https://mermaid.live/**

## 📋 Available Diagrams

### 1. New Application Flow
**File:** `01-new-application-flow.mmd`  
**Description:** Complete end-to-end flow for new health card applications  
**Phases:** Submission → Document Upload → Admin Review → Payment → Orientation → Issuance

---

### 2. Renewal Application Flow (NEW)
**File:** `02-renewal-application-flow.mmd`  
**Description:** Complete renewal process with eligibility check and pre-filling  
**Phases:** Eligibility → Card Selection → Pre-fill → Create Application → Submit → Approve → New Card

---

### 3. Document Review Process
**File:** `03-document-review-process.mmd`  
**Description:** Admin document verification with three outcomes  
**Outcomes:** Approve / Needs Revision / Medical Referral

---

### 4. Payment Processing - Maya (Online)
**File:** `04-payment-maya.mmd`  
**Description:** Online payment through Maya payment gateway  
**Features:** Checkout creation, webhooks, success/failure handling

---

### 5. Payment Processing - Manual
**File:** `05-payment-manual.mmd`  
**Description:** Manual payment at Barangay/City Hall with receipt upload  
**Features:** Receipt submission, admin validation, rejection handling

---

### 6. Orientation Booking
**File:** `06-orientation-booking.mmd`  
**Description:** Complete orientation flow from booking to completion  
**Phases:** Schedule Creation → Booking → Check-in → Session → Check-out → Finalization

---

### 7. Health Card Issuance
**File:** `07-health-card-issuance.mmd`  
**Description:** Final approval and health card generation  
**Features:** Registration number generation, HTML card creation, user viewing

---

### 8. Renewal Eligibility Check (NEW)
**File:** `08-renewal-eligibility-check.mmd`  
**Description:** Detailed eligibility verification for renewals  
**Checks:** Authentication, pending apps, previous cards, expiry status

---

## 🎨 How to Use

### Method 1: Mermaid Live Editor (Recommended)

1. Go to **https://mermaid.live/**
2. Open one of the `.mmd` files above
3. **Copy ALL the content** (Ctrl+A → Ctrl+C)
4. **Paste** into Mermaid Live editor (left panel)
5. Diagram renders automatically on the right
6. Click **"Actions"** → **"Export as PNG/SVG/PDF"**

### Method 2: GitHub (Auto-render)

1. Push this folder to your GitHub repo
2. View any `.mmd` file on GitHub
3. Change file extension in URL from `.mmd` to `.mermaid`
4. GitHub renders it automatically

### Method 3: VS Code (Local Preview)

1. Install extension: "Markdown Preview Mermaid Support"
2. Open any `.mmd` file
3. Press `Ctrl+Shift+V` to preview
4. Right-click → Export

---

## 📊 File Format

All files are in **pure Mermaid syntax** (no markdown wrappers):
- ✅ **Ready to paste** directly into mermaid.live
- ✅ **No need to remove** \`\`\`mermaid tags
- ✅ **One diagram per file** for easy management

---

## 💡 Tips

### For High-Quality Exports:
- Use **SVG format** for scalability (best for documents)
- Use **PNG format** with high DPI for presentations
- Use **PDF format** for printing

### For Editing:
- Modify the `.mmd` files directly
- Test in mermaid.live before saving
- Keep backups of original files

### For Sharing:
- Export as PNG/SVG and include in documentation
- Or share the mermaid.live link directly
- Or commit to GitHub for auto-rendering

---

## 🔗 Related Files

- **Main Documentation:** `../CAPSTONE_SEQUENCE_DIAGRAMS.md`
- **Domain Diagram:** `../CAPSTONE_DOMAIN_DIAGRAM.md`
- **Implementation Guide:** `../RENEWAL_MASTER_IMPLEMENTATION_GUIDE.md`

---

**Created:** 2025-11-15  
**Purpose:** Capstone Project Documentation  
**Total Diagrams:** 8 (including 2 NEW renewal features)
