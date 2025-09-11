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
import type * as admin_clearNotifications from "../admin/clearNotifications.js";
import type * as admin_dataMigration from "../admin/dataMigration.js";
import type * as admin_migrations from "../admin/migrations.js";
import type * as admin_seed from "../admin/seed.js";
import type * as applications_createApplication from "../applications/createApplication.js";
import type * as applications_getApplicationById from "../applications/getApplicationById.js";
import type * as applications_getUserApplications from "../applications/getUserApplications.js";
import type * as applications_submitApplication from "../applications/submitApplication.js";
import type * as applications_updateApplication from "../applications/updateApplication.js";
import type * as dashboard_getDashboardData from "../dashboard/getDashboardData.js";
import type * as healthCards_getByFormId from "../healthCards/getByFormId.js";
import type * as healthCards_getByVerificationToken from "../healthCards/getByVerificationToken.js";
import type * as healthCards_getUserCards from "../healthCards/getUserCards.js";
import type * as healthCards_issueHealthCard from "../healthCards/issueHealthCard.js";
import type * as healthCards_updateHealthCard from "../healthCards/updateHealthCard.js";
import type * as http from "../http.js";
import type * as jobCategories_createJobCategory from "../jobCategories/createJobCategory.js";
import type * as jobCategories_deleteJobCategory from "../jobCategories/deleteJobCategory.js";
import type * as jobCategories_getAllJobCategories from "../jobCategories/getAllJobCategories.js";
import type * as jobCategories_getJobCategoryById from "../jobCategories/getJobCategoryById.js";
import type * as jobCategories_updateJobCategory from "../jobCategories/updateJobCategory.js";
import type * as notifications_createNotification from "../notifications/createNotification.js";
import type * as notifications_getUnreadCount from "../notifications/getUnreadCount.js";
import type * as notifications_getUserNotifications from "../notifications/getUserNotifications.js";
import type * as notifications_markAllAsRead from "../notifications/markAllAsRead.js";
import type * as notifications_markAsRead from "../notifications/markAsRead.js";
import type * as orientations_getUserOrientations from "../orientations/getUserOrientations.js";
import type * as payments_createPayment from "../payments/createPayment.js";
import type * as payments_getPaymentByFormId from "../payments/getPaymentByFormId.js";
import type * as payments_getUserPayments from "../payments/getUserPayments.js";
import type * as payments_updatePaymentStatus from "../payments/updatePaymentStatus.js";
import type * as requirements_documentRequirements from "../requirements/documentRequirements.js";
import type * as requirements_getDocumentUrl from "../requirements/getDocumentUrl.js";
import type * as requirements_getFormDocumentsRequirements from "../requirements/getFormDocumentsRequirements.js";
import type * as requirements_getJobCategoryRequirements from "../requirements/getJobCategoryRequirements.js";
import type * as requirements_getRequirementsByJobCategory from "../requirements/getRequirementsByJobCategory.js";
import type * as requirements_removeDocument from "../requirements/removeDocument.js";
import type * as requirements_updateDocumentField from "../requirements/updateDocumentField.js";
import type * as requirements_uploadDocuments from "../requirements/uploadDocuments.js";
import type * as storage_generateUploadUrl from "../storage/generateUploadUrl.js";
import type * as users_createUser from "../users/createUser.js";
import type * as users_getCurrentUser from "../users/getCurrentUser.js";
import type * as users_getUsersByRole from "../users/getUsersByRole.js";
import type * as users_updateRole from "../users/updateRole.js";
import type * as users_updateUser from "../users/updateUser.js";
import type * as verification_createVerificationLog from "../verification/createVerificationLog.js";
import type * as verification_getVerificationLogsByHealthCard from "../verification/getVerificationLogsByHealthCard.js";
import type * as verification_getVerificationLogsByUser from "../verification/getVerificationLogsByUser.js";
import type * as verification_getVerificationStats from "../verification/getVerificationStats.js";
import type * as verification_logQRScan from "../verification/logQRScan.js";
import type * as verification_logVerificationAttempt from "../verification/logVerificationAttempt.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "admin/clearNotifications": typeof admin_clearNotifications;
  "admin/dataMigration": typeof admin_dataMigration;
  "admin/migrations": typeof admin_migrations;
  "admin/seed": typeof admin_seed;
  "applications/createApplication": typeof applications_createApplication;
  "applications/getApplicationById": typeof applications_getApplicationById;
  "applications/getUserApplications": typeof applications_getUserApplications;
  "applications/submitApplication": typeof applications_submitApplication;
  "applications/updateApplication": typeof applications_updateApplication;
  "dashboard/getDashboardData": typeof dashboard_getDashboardData;
  "healthCards/getByFormId": typeof healthCards_getByFormId;
  "healthCards/getByVerificationToken": typeof healthCards_getByVerificationToken;
  "healthCards/getUserCards": typeof healthCards_getUserCards;
  "healthCards/issueHealthCard": typeof healthCards_issueHealthCard;
  "healthCards/updateHealthCard": typeof healthCards_updateHealthCard;
  http: typeof http;
  "jobCategories/createJobCategory": typeof jobCategories_createJobCategory;
  "jobCategories/deleteJobCategory": typeof jobCategories_deleteJobCategory;
  "jobCategories/getAllJobCategories": typeof jobCategories_getAllJobCategories;
  "jobCategories/getJobCategoryById": typeof jobCategories_getJobCategoryById;
  "jobCategories/updateJobCategory": typeof jobCategories_updateJobCategory;
  "notifications/createNotification": typeof notifications_createNotification;
  "notifications/getUnreadCount": typeof notifications_getUnreadCount;
  "notifications/getUserNotifications": typeof notifications_getUserNotifications;
  "notifications/markAllAsRead": typeof notifications_markAllAsRead;
  "notifications/markAsRead": typeof notifications_markAsRead;
  "orientations/getUserOrientations": typeof orientations_getUserOrientations;
  "payments/createPayment": typeof payments_createPayment;
  "payments/getPaymentByFormId": typeof payments_getPaymentByFormId;
  "payments/getUserPayments": typeof payments_getUserPayments;
  "payments/updatePaymentStatus": typeof payments_updatePaymentStatus;
  "requirements/documentRequirements": typeof requirements_documentRequirements;
  "requirements/getDocumentUrl": typeof requirements_getDocumentUrl;
  "requirements/getFormDocumentsRequirements": typeof requirements_getFormDocumentsRequirements;
  "requirements/getJobCategoryRequirements": typeof requirements_getJobCategoryRequirements;
  "requirements/getRequirementsByJobCategory": typeof requirements_getRequirementsByJobCategory;
  "requirements/removeDocument": typeof requirements_removeDocument;
  "requirements/updateDocumentField": typeof requirements_updateDocumentField;
  "requirements/uploadDocuments": typeof requirements_uploadDocuments;
  "storage/generateUploadUrl": typeof storage_generateUploadUrl;
  "users/createUser": typeof users_createUser;
  "users/getCurrentUser": typeof users_getCurrentUser;
  "users/getUsersByRole": typeof users_getUsersByRole;
  "users/updateRole": typeof users_updateRole;
  "users/updateUser": typeof users_updateUser;
  "verification/createVerificationLog": typeof verification_createVerificationLog;
  "verification/getVerificationLogsByHealthCard": typeof verification_getVerificationLogsByHealthCard;
  "verification/getVerificationLogsByUser": typeof verification_getVerificationLogsByUser;
  "verification/getVerificationStats": typeof verification_getVerificationStats;
  "verification/logQRScan": typeof verification_logQRScan;
  "verification/logVerificationAttempt": typeof verification_logVerificationAttempt;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
