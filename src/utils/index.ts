export { default as designSystem, scale, verticalScale, moderateScale, moderateVerticalScale, fontScale,
   micro, caption, action, body, headline, title, largeTitle } from './designSystem';

export { wp as widthPercentageToDP, hp as heightPercentageToDP } from './designSystem';

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
