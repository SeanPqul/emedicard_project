// Helper function to convert file blob to base64
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data:mime;base64, prefix to get just the base64 string
      const base64 = result.split(',')[1];
      if (base64 !== undefined) {
        resolve(base64);
      } else {
        reject(new Error('Failed to extract base64 string from blob.'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};