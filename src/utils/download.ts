/**
 * Utility function to download blob data as a file
 */
export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Utility function to export data with proper error handling
 */
export const handleExport = async (
  exportFn: () => Promise<Blob>,
  filename: string,
  onError?: (error: unknown) => void
): Promise<void> => {
  try {
    const blob = await exportFn();
    downloadBlob(blob, filename);
  } catch (err) {
    console.error('Error exporting data:', err);
    onError?.(err);
  }
};