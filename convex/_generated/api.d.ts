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
import type * as admin_migrations from "../admin/migrations.js";
import type * as admin_seed from "../admin/seed.js";
import type * as forms_createForm from "../forms/createForm.js";
import type * as forms_getById from "../forms/getById.js";
import type * as forms_getUserApplications from "../forms/getUserApplications.js";
import type * as forms_submitApplicationForm from "../forms/submitApplicationForm.js";
import type * as forms_updateForm from "../forms/updateForm.js";
import type * as healthCards_getByFormId from "../healthCards/getByFormId.js";
import type * as healthCards_getByVerificationToken from "../healthCards/getByVerificationToken.js";
import type * as healthCards_getUserCards from "../healthCards/getUserCards.js";
import type * as healthCards_issueHealthCard from "../healthCards/issueHealthCard.js";
import type * as healthCards_updateHealthCard from "../healthCards/updateHealthCard.js";
import type * as http from "../http.js";
import type * as jobCategories_createJobType from "../jobCategories/createJobType.js";
import type * as jobCategories_deleteJobType from "../jobCategories/deleteJobType.js";
import type * as jobCategories_getAllJobType from "../jobCategories/getAllJobType.js";
import type * as jobCategories_getById from "../jobCategories/getById.js";
import type * as jobCategories_updateJobType from "../jobCategories/updateJobType.js";
import type * as migrations from "../migrations.js";
import type * as notifications_createNotif from "../notifications/createNotif.js";
import type * as notifications_getUnreadCount from "../notifications/getUnreadCount.js";
import type * as notifications_getUserNotifications from "../notifications/getUserNotifications.js";
import type * as notifications_markAllAsRead from "../notifications/markAllAsRead.js";
import type * as notifications_markAsRead from "../notifications/markAsRead.js";
import type * as orientations_getUserOrientations from "../orientations/getUserOrientations.js";
import type * as payments_createPayment from "../payments/createPayment.js";
import type * as payments_getByFormId from "../payments/getByFormId.js";
import type * as payments_getUserPayments from "../payments/getUserPayments.js";
import type * as requirements_adminBatchReviewDocuments from "../requirements/adminBatchReviewDocuments.js";
import type * as requirements_adminGetDocumentsByStatus from "../requirements/adminGetDocumentsByStatus.js";
import type * as requirements_adminGetPendingDocuments from "../requirements/adminGetPendingDocuments.js";
import type * as requirements_adminReviewDocument from "../requirements/adminReviewDocument.js";
import type * as requirements_createJobCategoryRequirement from "../requirements/createJobCategoryRequirement.js";
import type * as requirements_deleteDocument from "../requirements/deleteDocument.js";
import type * as requirements_deleteJobCategoryRequirement from "../requirements/deleteJobCategoryRequirement.js";
import type * as requirements_generateUploadUrl from "../requirements/generateUploadUrl.js";
import type * as requirements_getCategoryRequirements from "../requirements/getCategoryRequirements.js";
import type * as requirements_getDocumentUrl from "../requirements/getDocumentUrl.js";
import type * as requirements_getFormDocuments from "../requirements/getFormDocuments.js";
import type * as requirements_getFormDocumentsById from "../requirements/getFormDocumentsById.js";
import type * as requirements_getJobCategoryRequirements from "../requirements/getJobCategoryRequirements.js";
import type * as requirements_getRequirementsByJobCategory from "../requirements/getRequirementsByJobCategory.js";
import type * as requirements_updateDocument from "../requirements/updateDocument.js";
import type * as requirements_updateDocumentField from "../requirements/updateDocumentField.js";
import type * as requirements_updateJobCategoryRequirement from "../requirements/updateJobCategoryRequirement.js";
import type * as requirements_uploadDocument from "../requirements/uploadDocument.js";
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
  "admin/migrations": typeof admin_migrations;
  "admin/seed": typeof admin_seed;
  "forms/createForm": typeof forms_createForm;
  "forms/getById": typeof forms_getById;
  "forms/getUserApplications": typeof forms_getUserApplications;
  "forms/submitApplicationForm": typeof forms_submitApplicationForm;
  "forms/updateForm": typeof forms_updateForm;
  "healthCards/getByFormId": typeof healthCards_getByFormId;
  "healthCards/getByVerificationToken": typeof healthCards_getByVerificationToken;
  "healthCards/getUserCards": typeof healthCards_getUserCards;
  "healthCards/issueHealthCard": typeof healthCards_issueHealthCard;
  "healthCards/updateHealthCard": typeof healthCards_updateHealthCard;
  http: typeof http;
  "jobCategories/createJobType": typeof jobCategories_createJobType;
  "jobCategories/deleteJobType": typeof jobCategories_deleteJobType;
  "jobCategories/getAllJobType": typeof jobCategories_getAllJobType;
  "jobCategories/getById": typeof jobCategories_getById;
  "jobCategories/updateJobType": typeof jobCategories_updateJobType;
  migrations: typeof migrations;
  "notifications/createNotif": typeof notifications_createNotif;
  "notifications/getUnreadCount": typeof notifications_getUnreadCount;
  "notifications/getUserNotifications": typeof notifications_getUserNotifications;
  "notifications/markAllAsRead": typeof notifications_markAllAsRead;
  "notifications/markAsRead": typeof notifications_markAsRead;
  "orientations/getUserOrientations": typeof orientations_getUserOrientations;
  "payments/createPayment": typeof payments_createPayment;
  "payments/getByFormId": typeof payments_getByFormId;
  "payments/getUserPayments": typeof payments_getUserPayments;
  "requirements/adminBatchReviewDocuments": typeof requirements_adminBatchReviewDocuments;
  "requirements/adminGetDocumentsByStatus": typeof requirements_adminGetDocumentsByStatus;
  "requirements/adminGetPendingDocuments": typeof requirements_adminGetPendingDocuments;
  "requirements/adminReviewDocument": typeof requirements_adminReviewDocument;
  "requirements/createJobCategoryRequirement": typeof requirements_createJobCategoryRequirement;
  "requirements/deleteDocument": typeof requirements_deleteDocument;
  "requirements/deleteJobCategoryRequirement": typeof requirements_deleteJobCategoryRequirement;
  "requirements/generateUploadUrl": typeof requirements_generateUploadUrl;
  "requirements/getCategoryRequirements": typeof requirements_getCategoryRequirements;
  "requirements/getDocumentUrl": typeof requirements_getDocumentUrl;
  "requirements/getFormDocuments": typeof requirements_getFormDocuments;
  "requirements/getFormDocumentsById": typeof requirements_getFormDocumentsById;
  "requirements/getJobCategoryRequirements": typeof requirements_getJobCategoryRequirements;
  "requirements/getRequirementsByJobCategory": typeof requirements_getRequirementsByJobCategory;
  "requirements/updateDocument": typeof requirements_updateDocument;
  "requirements/updateDocumentField": typeof requirements_updateDocumentField;
  "requirements/updateJobCategoryRequirement": typeof requirements_updateJobCategoryRequirement;
  "requirements/uploadDocument": typeof requirements_uploadDocument;
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
