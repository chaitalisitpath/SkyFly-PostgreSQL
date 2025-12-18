import { api } from '@/lib/api';

export const downloadBookingPDF = async (bookingId: number): Promise<void> => {
  try {
    const response = await api.get(`/pdf/${bookingId}`, {
      responseType: 'blob', // Important for handling binary data
    });

    // Create a blob from the response data
    const blob = new Blob([response.data], { type: 'application/pdf' });

    // Create a URL for the blob
    const url = window.URL.createObjectURL(blob);
    console.log(url);

    // Create a temporary anchor element and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = `e-ticket-${bookingId}.pdf`;
    document.body.appendChild(link);
    link.click();

    // Clean up
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download PDF:', error);
    throw new Error('Failed to download e-ticket. Please try again.');
  }
};