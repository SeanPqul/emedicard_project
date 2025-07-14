# eMediCard UI Design Prompt & Implementation Guide

## Project Overview
eMediCard is a health card application management system for food handlers and security guards. Users can apply for health cards, upload required documents, make payments, attend orientations, and receive digital health cards.

## Tech Stack
- **Frontend**: React Native with Expo
- **Database**: Convex
- **Authentication**: Clerk
- **Navigation**: Expo Router with bottom tabs

## Core User Types & Workflows

### 1. **Applicants (Main Users)**
- Register/Login → Complete Profile → Apply for Health Card → Upload Documents → Payment → Orientation (if required) → Receive Digital Card

### 2. **Administrators/Inspectors**
- Review Applications → Approve/Reject → Schedule Orientations → Issue Cards → Scan QR Codes

---

## Complete Screen Structure & UI Design

### 🏠 **DASHBOARD/HOME SCREEN** (`index.tsx`)

#### **Design Requirements:**
```
Header Section:
- Welcome message with user's name
- Profile picture (circular)
- Current date and time
- Notification bell icon with badge

Quick Stats Cards (2x2 grid):
- "Active Applications" (count + status)
- "Pending Payments" (count + amount)
- "Upcoming Orientations" (date + time)
- "Valid Health Cards" (count + expiry)

Quick Actions Section:
- "New Application" button (primary)
- "Upload Documents" button
- "Make Payment" button
- "View QR Code" button

Recent Activity Feed:
- Last 3-5 activities with icons and timestamps
- "View All" link to full activity log

Bottom Navigation:
- Home (active)
- Apply
- Applications
- Notifications
- Profile
```

#### **Functionality:**
- Real-time data from Convex
- Pull-to-refresh capability
- Quick navigation shortcuts
- Status indicators for each card type

---

### 📝 **APPLICATION SCREEN** (`apply.tsx`)

#### **Design Requirements:**
```
Step Indicator:
- Visual progress bar (1/4 steps)
- Step titles: Basic Info → Job Category → Requirements → Payment

Form Section:
- Application Type: Toggle (New/Renew)
- Job Category: Dropdown with color-coded options
  - Food Handler (Yellow card)
  - Security Guard (Blue card)
  - Others (different colors)
- Position: Text input
- Organization: Text input
- Civil Status: Dropdown

Document Requirements Preview:
- Dynamic list based on job category
- Checkmark indicators for uploaded docs
- "Upload" buttons for each requirement

Cost Summary:
- Application fee: ₱50
- Service fee: ₱10
- Total: ₱60
- Payment methods available
```

#### **Functionality:**
- Form validation
- Dynamic requirements based on job category
- Auto-save draft functionality
- Cost calculation
- File upload integration

---

### 📋 **APPLICATIONS MANAGEMENT** (`application.tsx`)

#### **Design Requirements:**
```
Filter/Search Bar:
- Search by application ID
- Filter by status (Submitted, Under Review, Approved, Rejected)
- Filter by date range
- Sort options

Application Cards:
- Application ID
- Job category (with color indicator)
- Status badge with appropriate colors
- Date submitted
- Progress indicator
- Action buttons (View, Edit, Cancel)

Status Timeline:
- Visual timeline showing application progress
- Estimated completion time
- Next steps indicator

Empty State:
- "No applications yet" illustration
- "Start New Application" button
```

#### **Functionality:**
- Real-time status updates
- Push notifications for status changes
- Application tracking
- Document re-upload capability
- Application cancellation

---

### 🔔 **NOTIFICATIONS SCREEN** (`notification.tsx`)

#### **Design Requirements:**
```
Notification Categories:
- All, Unread, Applications, Payments, Orientations

Notification Items:
- Icon based on notification type
- Title and description
- Timestamp
- Read/unread indicator
- Action buttons where applicable

Notification Types:
- Missing Document alerts
- Payment confirmations
- Application approvals/rejections
- Orientation schedules
- Card issuance notifications

Settings:
- Push notification toggles
- Email notification preferences
- Notification sound settings
```

#### **Functionality:**
- Mark as read/unread
- Batch actions (mark all as read)
- Deep linking to relevant screens
- Push notification handling

---

### 👤 **PROFILE SCREEN** (`profile.tsx`)

#### **Design Requirements:**
```
Profile Header:
- Large profile picture
- Edit profile button
- User's full name and username
- Member since date

Personal Information:
- Email, Phone, Gender, Birth Date
- Edit buttons for each field
- Verification status indicators

Health Cards Section:
- Active cards with QR codes
- Expiry dates
- Download/share options
- Renewal reminders

Account Settings:
- Password change
- Two-factor authentication
- Privacy settings
- Language preferences

Support & Help:
- FAQ section
- Contact support
- App version info
- Sign out button
```

#### **Functionality:**
- Profile picture upload
- Information editing
- QR code generation
- Card sharing functionality
- Account management

---

## 🔄 **ADDITIONAL SCREENS NEEDED**

### **1. Document Upload Screen**
```
Design:
- Document type selector
- Camera/gallery picker
- Image preview with crop/rotate
- Upload progress indicator
- Success/error feedback

Functionality:
- Multiple file formats support
- Image compression
- Upload retry mechanism
- Document validation
```

### **2. Payment Screen**
```
Design:
- Payment method selection (GCash, Maya, BaranggayHall, CityHall)
- Amount breakdown
- Payment form (reference number, receipt upload)
- Payment history

Functionality:
- Payment processing
- Receipt generation
- Payment verification
- Refund handling
```

### **3. Orientation Screen**
```
Design:
- Orientation schedule
- QR code for check-in/out
- Timer for session duration
- Completion certificate

Functionality:
- QR code scanning
- Attendance tracking
- Certificate generation
- Reminder notifications
```

### **4. QR Code Scanner Screen**
```
Design:
- Camera viewfinder
- Scanning instructions
- Result display
- Verification status

Functionality:
- QR code detection
- Health card verification
- Verification log recording
- Offline capability
```

### **5. Health Card Display Screen**
```
Design:
- Digital card design
- QR code for verification
- Card details (name, category, expiry)
- Share/download options

Functionality:
- Dynamic QR code generation
- Card validation
- Sharing capabilities
- Offline access
```

---

## 🎨 **DESIGN SYSTEM SPECIFICATIONS**

### **Color Palette:**
``` use the theme.ts
```

### **Typography:**
```use the theme.ts
```

### **Component Specifications:**
```
Cards: 
- Corner radius: 12px
- Shadow: 0 2px 8px rgba(0,0,0,0.1)
- Padding: 16px

Buttons:
- Primary: Rounded, 44px height
- Secondary: Outlined, 40px height
- Corner radius: 8px

Forms:
- Input height: 48px
- Corner radius: 8px
- Border: 1px solid #E9ECEF

Icons:
- Size: 24px (default), 20px (small), 32px (large)
- Style: Outline preferred
```

---


## 🚀 **IMPLEMENTATION PRIORITIES**

### **Phase 1: Core Functionality**
1. Dashboard with basic stats
2. Application form with validation
3. Document upload system
4. Payment integration
5. Profile management

### **Phase 2: Advanced Features**
1. QR code generation/scanning
2. Orientation scheduling
3. Push notifications
4. Advanced filtering/search
5. Analytics dashboard

### **Phase 3: Optimization**
1. Offline capability
2. Performance optimization
3. Advanced security features
4. Multi-language support
5. Admin dashboard

---

## 📱 **RESPONSIVE DESIGN CONSIDERATIONS**

### **Mobile-First Approach:**
- Touch-friendly button sizes (minimum 44px)
- Swipe gestures for navigation
- Optimized for one-handed use
- Loading states for better UX

### **Tablet Optimization:**
- Side-by-side layouts
- Increased information density
- Enhanced navigation patterns
- Better use of screen real estate

---

## 🔐 **SECURITY & PRIVACY**

### **Data Protection:**
- Secure document storage
- Encrypted file uploads
- Privacy-compliant data handling
- Audit trail for sensitive actions

### **User Authentication:**
- Biometric authentication support
- Session management
- Secure logout
- Account recovery options

---

## 📊 **ANALYTICS & MONITORING**

### **User Analytics:**
- Application completion rates
- Most used features
- User journey tracking
- Error rate monitoring

### **Performance Metrics:**
- Load times
- Crash reports
- API response times
- User satisfaction scores

---

This comprehensive design guide provides a complete roadmap for implementing your eMediCard application with all necessary screens and functionality. Each screen is designed to work seamlessly with your existing Convex schema and Clerk authentication system.
