import apiClient from '../config/index';
import ShowNotifications from '../helper/ShowNotifications';

export const ticketApi = {
    // Get all tickets for the authenticated restaurant
    getTickets: async (params = {}) => {
        try {
            const response = await apiClient.get('/tickets', { params });
            if (response.status === 200 || response.status === 201) {
                return { status: true, ...response.data };
            }
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to Fetch Tickets';
            if (error?.response?.status !== 401) {
                ShowNotifications.showAlertNotification(errorMessage, false);
            }
            return { status: false, error: errorMessage };
        }
    },

    // Create a new ticket
    createTicket: async (ticketData) => {
        try {
            const response = await apiClient.post('/tickets', ticketData);
            if (response.status === 200 || response.status === 201) {
                return { status: true, data: response.data };
            }
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to Create Ticket';
            if (error?.response?.status !== 401) {
                ShowNotifications.showAlertNotification(errorMessage, false);
            }
            throw new Error(errorMessage);
        }
    }
};
