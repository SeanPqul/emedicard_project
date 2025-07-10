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
import type * as forms from "../forms.js";
import type * as healthCards from "../healthCards.js";
import type * as http from "../http.js";
import type * as jobCategories from "../jobCategories.js";
import type * as notifications from "../notifications.js";
import type * as payments from "../payments.js";
import type * as requirements from "../requirements.js";
import type * as seedData from "../seedData.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  forms: typeof forms;
  healthCards: typeof healthCards;
  http: typeof http;
  jobCategories: typeof jobCategories;
  notifications: typeof notifications;
  payments: typeof payments;
  requirements: typeof requirements;
  seedData: typeof seedData;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
