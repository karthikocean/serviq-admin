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
    },

    // Update an existing ticket
    updateTicket: async (ticketId, ticketData) => {
        try {
            const response = await apiClient.put(`/tickets/${ticketId}`, ticketData);
            if (response.status === 200 || response.status === 201) {
                return { status: true, data: response.data };
            }
            return { status: false, data: response.data };
        } catch (error) {
            try {
                const patchRes = await apiClient.patch(`/tickets/${ticketId}`, ticketData);
                if (patchRes.status === 200 || patchRes.status === 201) {
                    return { status: true, data: patchRes.data };
                }
            } catch (patchErr) {
                // Ignore fallback error
            }
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to Update Ticket';
            if (error?.response?.status !== 401) {
                ShowNotifications.showAlertNotification(errorMessage, false);
            }
            throw new Error(errorMessage);
        }
    },

    // Delete a ticket
    deleteTicket: async (ticketId) => {
        try {
            const response = await apiClient.delete(`/tickets/${ticketId}`);
            if (response.status === 200 || response.status === 201 || response.status === 204) {
                return { status: true, data: response.data };
            }
            return { status: false, data: response.data };
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to Delete Ticket';
            if (error?.response?.status !== 401) {
                ShowNotifications.showAlertNotification(errorMessage, false);
            }
            throw new Error(errorMessage);
        }
    }
};
