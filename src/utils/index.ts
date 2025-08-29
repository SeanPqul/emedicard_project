export { designSystem, scale, verticalScale, moderateScale, moderateVerticalScale, fontScale,
   micro, caption, action, body, headline, title, largeTitle } from './responsive';

export { wp as widthPercentageToDP, hp as heightPercentageToDP } from './responsive';

export { default as storageHelper, storage, encryptedStorage, createUserStorage,
  setItem, getItem, setNumber, getNumber, setBoolean, getBoolean,
  setObject, getObject, removeItem, clearAll, getAllKeys,
  hasKey, getStorageSize, trimStorage, encryptStorage, removeEncryption,
  storageHelper as storageUtils } from './storage';

export { default as userUtils, generateDisplayNameFromEmail, getUserDisplayName,
  hasPlaceholderName } from './user-utils';

export { cacheDocument, getCachedDocument, getCachedDocumentsByForm, updateCachedDocumentStatus,
  removeCachedDocument, clearFormCache, getAllCachedDocuments, getFailedDocuments,
  cleanupOldCache, getCacheStats } from './documentCache';

export { getHealthCardTypeName, getPaymentMethods } from './health-card-utils';

export { 
  getCardColor, 
  getCardStatus, 
  getStatusColor, 
  generateVerificationUrl, 
  formatDate, 
  generateCardHtml,
  type HealthCardData 
} from './health-card-display-utils';

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
