import apiClient from '../config/index';
import ShowNotifications from '../helper/ShowNotifications';

export const ticketApi = {
    // Get all tickets for the authenticated restaurant
    getTickets: async (params = {}) => {
        try {
            const cleanParams = {};
            Object.keys(params).forEach(key => {
                if (params[key] !== undefined && params[key] !== null && params[key] !== '' && params[key] !== 'ALL' && params[key] !== 'All') {
                    cleanParams[key] = params[key];
                }
            });
            const searchVal = params.search || params.searchQuery || params.searchTerm;
            if (searchVal && !cleanParams.search) cleanParams.search = searchVal;
            if (params.status && !cleanParams.status && params.status !== 'All' && params.status !== 'ALL') cleanParams.status = params.status;
            if (params.priority && !cleanParams.priority && params.priority !== 'All' && params.priority !== 'ALL') cleanParams.priority = params.priority;
            if (params.branchId && !cleanParams.branchId && params.branchId !== 'All' && params.branchId !== 'ALL') cleanParams.branchId = params.branchId;

            // Load all current tickets (or specified limit)
            if (!cleanParams.limit) {
                cleanParams.limit = 100;
            }

            const response = await apiClient.get('/tickets', { params: cleanParams });
            if (response.status === 200 || response.status === 201) {
                const resData = response.data;
                const ticketList = Array.isArray(resData?.data) ? resData.data : (Array.isArray(resData) ? resData : []);
                return {
                    status: true,
                    data: ticketList,
                    total: resData?.total ?? ticketList.length,
                    totalPages: resData?.totalPages,
                    currentPage: resData?.currentPage,
                    from: resData?.from,
                    to: resData?.to,
                    ...resData
                };
            }
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to Fetch Tickets';
            console.warn("TicketApi getTickets note:", errorMessage);
            return { status: false, error: errorMessage, data: [] };
        }
    },

    // Create a new ticket
    createTicket: async (ticketData) => {
        try {
            const attachmentUrl = ticketData.attachmentUrl || ticketData.attachment || '';
            const ticketRaisedTo = ticketData.ticketRaisedTo || (ticketData.raisedTo === 'Super Admin' ? 'Super Admin' : 'Company Admin');

            const payload = {
                ...ticketData,
                attachmentUrl,
                attachment: attachmentUrl,
                ticketRaisedTo,
                raisedTo: ticketRaisedTo
            };

            const response = await apiClient.post('/tickets', payload);
            if (response.status === 200 || response.status === 201) {
                return { status: true, data: response.data?.data || response.data };
            }
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to Create Ticket';
            if (error?.response?.status !== 401) {
                ShowNotifications.showAlertNotification(errorMessage, false);
            }
            throw new Error(errorMessage);
        }
    },

    // Escalate a ticket to Super Admin
    escalateTicket: async (ticketId, escalationReason) => {
        try {
            const reasonText = typeof escalationReason === 'object'
                ? (escalationReason.escalationReason || escalationReason.reason || '')
                : (escalationReason || 'Issue cannot be resolved at company level. Requires database sync fix from ServIQ core engineering team.');

            const payload = {
                escalationReason: reasonText,
                reason: reasonText
            };

            try {
                const response = await apiClient.put(`/tickets/${ticketId}/escalate`, payload);
                if (response.status === 200 || response.status === 201) {
                    return { status: true, data: response.data?.data || response.data };
                }
            } catch (putErr) {
                const postRes = await apiClient.post(`/tickets/${ticketId}/escalate`, payload);
                if (postRes.status === 200 || postRes.status === 201) {
                    return { status: true, data: postRes.data?.data || postRes.data };
                }
            }
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to Escalate Ticket';
            if (error?.response?.status !== 401) {
                ShowNotifications.showAlertNotification(errorMessage, false);
            }
            throw new Error(errorMessage);
        }
    },

    // Update ticket status & resolution (/tickets/:id/status)
    updateTicketStatus: async (ticketId, statusData) => {
        try {
            const payload = typeof statusData === 'string' ? { status: statusData } : statusData;

            try {
                const response = await apiClient.put(`/tickets/${ticketId}/status`, payload);
                if (response.status === 200 || response.status === 201) {
                    return { status: true, data: response.data?.data || response.data };
                }
            } catch (putErr) {
                try {
                    const patchRes = await apiClient.patch(`/tickets/${ticketId}/status`, payload);
                    if (patchRes.status === 200 || patchRes.status === 201) {
                        return { status: true, data: patchRes.data?.data || patchRes.data };
                    }
                } catch (patchErr) {
                    const postRes = await apiClient.post(`/tickets/${ticketId}/status`, payload);
                    if (postRes.status === 200 || postRes.status === 201) {
                        return { status: true, data: postRes.data?.data || postRes.data };
                    }
                }
            }
        } catch (error) {
            // Fallback to general updateTicket if /status endpoint is not found
            return await ticketApi.updateTicket(ticketId, typeof statusData === 'string' ? { status: statusData } : statusData);
        }
    },

    // Update an existing ticket
    updateTicket: async (ticketId, ticketData) => {
        try {
            const response = await apiClient.put(`/tickets/${ticketId}`, ticketData);
            if (response.status === 200 || response.status === 201) {
                return { status: true, data: response.data?.data || response.data };
            }
            return { status: false, data: response.data };
        } catch (error) {
            try {
                const patchRes = await apiClient.patch(`/tickets/${ticketId}`, ticketData);
                if (patchRes.status === 200 || patchRes.status === 201) {
                    return { status: true, data: patchRes.data?.data || patchRes.data };
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
    addReply: async (ticketId, replyText, senderName, attachmentUrl = null, extra = {}) => {
        const payload = {
            reply: replyText,
            message: replyText,
            sender: senderName || 'Restaurant Admin',
            role: extra.role || 'user',
            isAdmin: extra.isAdmin !== undefined ? extra.isAdmin : false,
            ...(attachmentUrl ? { attachment: attachmentUrl, attachmentUrl } : {}),
            ...extra
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
                    const patchRes = await apiClient.patch(`/tickets/${ticketId}`, { 
                        reply: replyText, 
                        sender: senderName,
                        ...(attachmentUrl ? { attachment: attachmentUrl } : {}),
                        ...extra
                    });
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

export default ticketApi;
