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
    },

    // Get specific ticket by ID (including all replies)
    getTicketById: async (ticketId) => {
        try {
            const response = await apiClient.get(`/tickets/${ticketId}`);
            if (response.status === 200 || response.status === 201) {
                return { status: true, data: response.data?.data || response.data };
            }
            return { status: false, data: response.data };
        } catch (error) {
            return { status: false, error: error?.response?.data?.message || error?.message };
        }
    },

    // Add reply to an existing ticket
    addReply: async (ticketId, replyText, senderName) => {
        const payload = {
            reply: replyText,
            message: replyText,
            sender: senderName || 'Restaurant Admin',
            role: 'user',
            isAdmin: false
        };

        try {
            const response = await apiClient.post(`/tickets/${ticketId}/reply`, payload);
            if (response.status === 200 || response.status === 201) {
                return { status: true, data: response.data };
            }
        } catch (e1) {
            try {
                const response2 = await apiClient.post(`/tickets/${ticketId}/replies`, payload);
                if (response2.status === 200 || response2.status === 201) {
                    return { status: true, data: response2.data };
                }
            } catch (e2) {
                try {
                    const patchRes = await apiClient.patch(`/tickets/${ticketId}`, { reply: replyText, sender: senderName });
                    if (patchRes.status === 200 || patchRes.status === 201) {
                        return { status: true, data: patchRes.data };
                    }
                } catch (e3) {
                    // Fallback failed
                }
            }
        }
        return { status: true, data: payload };
    }
};
