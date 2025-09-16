export { designSystem, scale, verticalScale, moderateScale, moderateVerticalScale, fontScale,
   micro, caption, action, body, headline, title, largeTitle } from './responsive';

export { wp as widthPercentageToDP, hp as heightPercentageToDP } from './responsive';

export { default as storageHelper, storage, encryptedStorage, createUserStorage,
  setItem, getItem, setNumber, getNumber, setBoolean, getBoolean,
  setObject, getObject, removeItem, clearAll, getAllKeys,
  hasKey, getStorageSize, trimStorage, encryptStorage, removeEncryption,
  storageHelper as storageUtils } from './storage';

export { generateDisplayNameFromEmail, getUserDisplayName,
  hasPlaceholderName } from './user-utils';

export { cacheDocument, getCachedDocument, getCachedDocumentsByForm, updateCachedDocumentStatus,
  removeCachedDocument, clearFormCache, getAllCachedDocuments, getFailedDocuments,
  cleanupOldCache, getCacheStats } from './documentCache';

export { getHealthCardTypeName, getPaymentMethods } from './health-card-utils';

// Health card utilities moved to entities/healthCard

export {
  formatDate as formatOrientationDate,
  formatTime,
  getOrientationStatus,
  getStatusColor as getOrientationStatusColor,
  getStatusText
} from './orientation-utils';

export {
  getActivityIcon,
  getActivityStatusColor,
  formatTimestamp,
  type Activity
} from './activity-utils';

export { blobToBase64 } from './fileUtils';
