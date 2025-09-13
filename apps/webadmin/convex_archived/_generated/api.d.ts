/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as admin_finalizeApplication from "../admin/finalizeApplication.js";
import type * as admin_migrations from "../admin/migrations.js";
import type * as admin_reviewDocument from "../admin/reviewDocument.js";
import type * as admin_seed from "../admin/seed.js";
import type * as admin_validatePayment from "../admin/validatePayment.js";
import type * as admin from "../admin.js";
import type * as applications_createForm from "../applications/createForm.js";
import type * as applications_getById from "../applications/getById.js";
import type * as applications_getFormById from "../applications/getFormById.js";
import type * as applications_getUserApplications from "../applications/getUserApplications.js";
import type * as applications_getWithDocuments from "../applications/getWithDocuments.js";
import type * as applications_list from "../applications/list.js";
import type * as applications_submitApplicationForm from "../applications/submitApplicationForm.js";
import type * as applications_updateApplicationStatus from "../applications/updateApplicationStatus.js";
import type * as applications_updateForm from "../applications/updateForm.js";
import type * as dashboard_getActivityLog from "../dashboard/getActivityLog.js";
import type * as dashboard_getDashboardData from "../dashboard/getDashboardData.js";
import type * as documentUploads_getReviewedDocumentsWithDetails from "../documentUploads/getReviewedDocumentsWithDetails.js";
import type * as documents from "../documents.js";
import type * as healthCards_getByFormId from "../healthCards/getByFormId.js";
import type * as healthCards_getByVerificationToken from "../healthCards/getByVerificationToken.js";
import type * as healthCards_getUserCards from "../healthCards/getUserCards.js";
import type * as healthCards_issueHealthCard from "../healthCards/issueHealthCard.js";
import type * as healthCards_updateHealthCard from "../healthCards/updateHealthCard.js";
import type * as jobCategories_createJobCategory from "../jobCategories/createJobCategory.js";
import type * as jobCategories_deleteJobCategory from "../jobCategories/deleteJobCategory.js";
import type * as jobCategories_getAllJobCategories from "../jobCategories/getAllJobCategories.js";
import type * as jobCategories_getJobCategoryById from "../jobCategories/getJobCategoryById.js";
import type * as jobCategories_getManaged from "../jobCategories/getManaged.js";
import type * as jobCategories_seed from "../jobCategories/seed.js";
import type * as jobCategories_updateJobCategory from "../jobCategories/updateJobCategory.js";
import type * as notifications_createNotification from "../notifications/createNotification.js";
import type * as notifications_getUnreadCount from "../notifications/getUnreadCount.js";
import type * as notifications_getUserNotifications from "../notifications/getUserNotifications.js";
import type * as notifications_markAllAsRead from "../notifications/markAllAsRead.js";
import type * as notifications_markAsRead from "../notifications/markAsRead.js";
import type * as orientations_getUserOrientations from "../orientations/getUserOrientations.js";
import type * as orientations from "../orientations.js";
import type * as payments_createPayment from "../payments/createPayment.js";
import type * as payments_getForApplication from "../payments/getForApplication.js";
import type * as payments_getPaymentByFormId from "../payments/getPaymentByFormId.js";
import type * as payments_getPaymentReceiptUrl from "../payments/getPaymentReceiptUrl.js";
import type * as payments_getUserPayments from "../payments/getUserPayments.js";
import type * as payments_updatePaymentStatus from "../payments/updatePaymentStatus.js";
import type * as payments from "../payments.js";
import type * as requirements_adminBatchReviewDocuments from "../requirements/adminBatchReviewDocuments.js";
import type * as requirements_adminGetDocumentsByStatus from "../requirements/adminGetDocumentsByStatus.js";
import type * as requirements_adminGetPendingDocuments from "../requirements/adminGetPendingDocuments.js";
import type * as requirements_adminReviewDocument from "../requirements/adminReviewDocument.js";
import type * as requirements_createJobCategoryRequirement from "../requirements/createJobCategoryRequirement.js";
import type * as requirements_documentRequirements from "../requirements/documentRequirements.js";
import type * as requirements_getDocumentUrl from "../requirements/getDocumentUrl.js";
import type * as requirements_getFormDocumentsRequirements from "../requirements/getFormDocumentsRequirements.js";
import type * as requirements_getJobCategoryRequirements from "../requirements/getJobCategoryRequirements.js";
import type * as requirements_getRequirementsByJobCategory from "../requirements/getRequirementsByJobCategory.js";
import type * as requirements_removeDocument from "../requirements/removeDocument.js";
import type * as requirements_removeJobCategoryRequirement from "../requirements/removeJobCategoryRequirement.js";
import type * as requirements_updateDocumentField from "../requirements/updateDocumentField.js";
import type * as requirements_updateJobCategory from "../requirements/updateJobCategory.js";
import type * as requirements_updateJobCategoryRequirement from "../requirements/updateJobCategoryRequirement.js";
import type * as requirements_uploadDocuments from "../requirements/uploadDocuments.js";
import type * as storage_generateUploadUrl from "../storage/generateUploadUrl.js";
import type * as users_createUser from "../users/createUser.js";
import type * as users_getCurrentUser from "../users/getCurrentUser.js";
import type * as users_getUserById from "../users/getUserById.js";
import type * as users_getUsersByRole from "../users/getUsersByRole.js";
import type * as users_roles from "../users/roles.js";
import type * as users_updateRole from "../users/updateRole.js";
import type * as users_updateUser from "../users/updateUser.js";
import type * as users from "../users.js";
import type * as verification_createVerificationLog from "../verification/createVerificationLog.js";
import type * as verification_getVerificationLogsByHealthCard from "../verification/getVerificationLogsByHealthCard.js";
import type * as verification_getVerificationLogsByUser from "../verification/getVerificationLogsByUser.js";
import type * as verification_getVerificationStats from "../verification/getVerificationStats.js";
import type * as verification_logQRScan from "../verification/logQRScan.js";
import type * as verification_logVerificationAttempt from "../verification/logVerificationAttempt.js";
import type * as verification_verificationLogs from "../verification/verificationLogs.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "admin/finalizeApplication": typeof admin_finalizeApplication;
  "admin/migrations": typeof admin_migrations;
  "admin/reviewDocument": typeof admin_reviewDocument;
  "admin/seed": typeof admin_seed;
  "admin/validatePayment": typeof admin_validatePayment;
  admin: typeof admin;
  "applications/createForm": typeof applications_createForm;
  "applications/getById": typeof applications_getById;
  "applications/getFormById": typeof applications_getFormById;
  "applications/getUserApplications": typeof applications_getUserApplications;
  "applications/getWithDocuments": typeof applications_getWithDocuments;
  "applications/list": typeof applications_list;
  "applications/submitApplicationForm": typeof applications_submitApplicationForm;
  "applications/updateApplicationStatus": typeof applications_updateApplicationStatus;
  "applications/updateForm": typeof applications_updateForm;
  "dashboard/getActivityLog": typeof dashboard_getActivityLog;
  "dashboard/getDashboardData": typeof dashboard_getDashboardData;
  "documentUploads/getReviewedDocumentsWithDetails": typeof documentUploads_getReviewedDocumentsWithDetails;
  documents: typeof documents;
  "healthCards/getByFormId": typeof healthCards_getByFormId;
  "healthCards/getByVerificationToken": typeof healthCards_getByVerificationToken;
  "healthCards/getUserCards": typeof healthCards_getUserCards;
  "healthCards/issueHealthCard": typeof healthCards_issueHealthCard;
  "healthCards/updateHealthCard": typeof healthCards_updateHealthCard;
  "jobCategories/createJobCategory": typeof jobCategories_createJobCategory;
  "jobCategories/deleteJobCategory": typeof jobCategories_deleteJobCategory;
  "jobCategories/getAllJobCategories": typeof jobCategories_getAllJobCategories;
  "jobCategories/getJobCategoryById": typeof jobCategories_getJobCategoryById;
  "jobCategories/getManaged": typeof jobCategories_getManaged;
  "jobCategories/seed": typeof jobCategories_seed;
  "jobCategories/updateJobCategory": typeof jobCategories_updateJobCategory;
  "notifications/createNotification": typeof notifications_createNotification;
  "notifications/getUnreadCount": typeof notifications_getUnreadCount;
  "notifications/getUserNotifications": typeof notifications_getUserNotifications;
  "notifications/markAllAsRead": typeof notifications_markAllAsRead;
  "notifications/markAsRead": typeof notifications_markAsRead;
  "orientations/getUserOrientations": typeof orientations_getUserOrientations;
  orientations: typeof orientations;
  "payments/createPayment": typeof payments_createPayment;
  "payments/getForApplication": typeof payments_getForApplication;
  "payments/getPaymentByFormId": typeof payments_getPaymentByFormId;
  "payments/getPaymentReceiptUrl": typeof payments_getPaymentReceiptUrl;
  "payments/getUserPayments": typeof payments_getUserPayments;
  "payments/updatePaymentStatus": typeof payments_updatePaymentStatus;
  payments: typeof payments;
  "requirements/adminBatchReviewDocuments": typeof requirements_adminBatchReviewDocuments;
  "requirements/adminGetDocumentsByStatus": typeof requirements_adminGetDocumentsByStatus;
  "requirements/adminGetPendingDocuments": typeof requirements_adminGetPendingDocuments;
  "requirements/adminReviewDocument": typeof requirements_adminReviewDocument;
  "requirements/createJobCategoryRequirement": typeof requirements_createJobCategoryRequirement;
  "requirements/documentRequirements": typeof requirements_documentRequirements;
  "requirements/getDocumentUrl": typeof requirements_getDocumentUrl;
  "requirements/getFormDocumentsRequirements": typeof requirements_getFormDocumentsRequirements;
  "requirements/getJobCategoryRequirements": typeof requirements_getJobCategoryRequirements;
  "requirements/getRequirementsByJobCategory": typeof requirements_getRequirementsByJobCategory;
  "requirements/removeDocument": typeof requirements_removeDocument;
  "requirements/removeJobCategoryRequirement": typeof requirements_removeJobCategoryRequirement;
  "requirements/updateDocumentField": typeof requirements_updateDocumentField;
  "requirements/updateJobCategory": typeof requirements_updateJobCategory;
  "requirements/updateJobCategoryRequirement": typeof requirements_updateJobCategoryRequirement;
  "requirements/uploadDocuments": typeof requirements_uploadDocuments;
  "storage/generateUploadUrl": typeof storage_generateUploadUrl;
  "users/createUser": typeof users_createUser;
  "users/getCurrentUser": typeof users_getCurrentUser;
  "users/getUserById": typeof users_getUserById;
  "users/getUsersByRole": typeof users_getUsersByRole;
  "users/roles": typeof users_roles;
  "users/updateRole": typeof users_updateRole;
  "users/updateUser": typeof users_updateUser;
  users: typeof users;
  "verification/createVerificationLog": typeof verification_createVerificationLog;
  "verification/getVerificationLogsByHealthCard": typeof verification_getVerificationLogsByHealthCard;
  "verification/getVerificationLogsByUser": typeof verification_getVerificationLogsByUser;
  "verification/getVerificationStats": typeof verification_getVerificationStats;
  "verification/logQRScan": typeof verification_logQRScan;
  "verification/logVerificationAttempt": typeof verification_logVerificationAttempt;
  "verification/verificationLogs": typeof verification_verificationLogs;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
