// Structured Request Intake Service

import { Request, RequestTicket, RequestStats, RequestUrgency } from '../types/requests';

const API_BASE = 'http://localhost:3000/api/v1';

export const requestService = {
  // Get all requests
  async getRequests(orgId: string, filters?: { status?: string; urgency?: string }): Promise<Request[]> {
    try {
      let url = `${API_BASE}/requests?org_id=${orgId}`;
      if (filters?.status) url += `&status=${filters.status}`;
      if (filters?.urgency) url += `&urgency=${filters.urgency}`;

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        return data.data || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching requests:', error);
      return [];
    }
  },

  // Get request by ID
  async getRequestById(requestId: string): Promise<Request | null> {
    try {
      const response = await fetch(`${API_BASE}/requests/${requestId}`);
      if (response.ok) {
        const data = await response.json();
        return data.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching request:', error);
      return null;
    }
  },

  // Create request
  async createRequest(
    orgId: string,
    requesterId: string,
    request: Omit<Request, 'id' | 'orgId' | 'requesterId' | 'slaDueAt' | 'createdAt' | 'updatedAt'>
  ): Promise<Request | null> {
    try {
      const response = await fetch(`${API_BASE}/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...request, orgId, requesterId })
      });
      if (response.ok) {
        const data = await response.json();
        return data.data;
      }
      return null;
    } catch (error) {
      console.error('Error creating request:', error);
      return null;
    }
  },

  // Update request
  async updateRequest(requestId: string, updates: Partial<Request>): Promise<Request | null> {
    try {
      const response = await fetch(`${API_BASE}/requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (response.ok) {
        const data = await response.json();
        return data.data;
      }
      return null;
    } catch (error) {
      console.error('Error updating request:', error);
      return null;
    }
  },

  // Delete request
  async deleteRequest(requestId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/requests/${requestId}`, {
        method: 'DELETE'
      });
      return response.ok;
    } catch (error) {
      console.error('Error deleting request:', error);
      return false;
    }
  },

  // Update request status
  async updateRequestStatus(requestId: string, status: string): Promise<Request | null> {
    return this.updateRequest(requestId, { status: status as any });
  },

  // Assign request
  async assignRequest(requestId: string, assignTo: string): Promise<Request | null> {
    return this.updateRequest(requestId, { assignedTo: assignTo });
  },

  // Get requests by urgency
  async getRequestsByUrgency(orgId: string, urgency: RequestUrgency): Promise<Request[]> {
    try {
      const response = await fetch(
        `${API_BASE}/requests?org_id=${orgId}&urgency=${urgency}`
      );
      if (response.ok) {
        const data = await response.json();
        return data.data || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching requests by urgency:', error);
      return [];
    }
  },

  // Get requests by status
  async getRequestsByStatus(orgId: string, status: string): Promise<Request[]> {
    try {
      const response = await fetch(
        `${API_BASE}/requests?org_id=${orgId}&status=${status}`
      );
      if (response.ok) {
        const data = await response.json();
        return data.data || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching requests by status:', error);
      return [];
    }
  },

  // Get SLA breached requests
  async getSLABreachedRequests(orgId: string): Promise<Request[]> {
    try {
      const response = await fetch(
        `${API_BASE}/requests/sla/breached?org_id=${orgId}`
      );
      if (response.ok) {
        const data = await response.json();
        return data.data || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching SLA breached requests:', error);
      return [];
    }
  },

  // Get request statistics
  async getRequestStats(orgId: string): Promise<RequestStats | null> {
    try {
      const response = await fetch(
        `${API_BASE}/requests/statistics?org_id=${orgId}`
      );
      if (response.ok) {
        const data = await response.json();
        return data.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching request stats:', error);
      return null;
    }
  },

  // Get request ticket
  async getRequestTicket(requestId: string): Promise<RequestTicket | null> {
    try {
      const response = await fetch(
        `${API_BASE}/requests/${requestId}/ticket`
      );
      if (response.ok) {
        const data = await response.json();
        return data.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching request ticket:', error);
      return null;
    }
  },

  // Add note to request
  async addNote(requestId: string, note: string): Promise<Request | null> {
    try {
      const response = await fetch(
        `${API_BASE}/requests/${requestId}/notes`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ note })
        }
      );
      if (response.ok) {
        const data = await response.json();
        return data.data;
      }
      return null;
    } catch (error) {
      console.error('Error adding note:', error);
      return null;
    }
  },

  // Upload attachment
  async uploadAttachment(requestId: string, file: File): Promise<string | null> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(
        `${API_BASE}/requests/${requestId}/attachments`,
        {
          method: 'POST',
          body: formData
        }
      );
      if (response.ok) {
        const data = await response.json();
        return data.data?.url;
      }
      return null;
    } catch (error) {
      console.error('Error uploading attachment:', error);
      return null;
    }
  },

  // Escalate request
  async escalateRequest(requestId: string, reason: string): Promise<Request | null> {
    try {
      const response = await fetch(
        `${API_BASE}/requests/${requestId}/escalate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason })
        }
      );
      if (response.ok) {
        const data = await response.json();
        return data.data;
      }
      return null;
    } catch (error) {
      console.error('Error escalating request:', error);
      return null;
    }
  },

  // Resolve request
  async resolveRequest(requestId: string, resolution: string): Promise<Request | null> {
    try {
      const response = await fetch(
        `${API_BASE}/requests/${requestId}/resolve`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resolution })
        }
      );
      if (response.ok) {
        const data = await response.json();
        return data.data;
      }
      return null;
    } catch (error) {
      console.error('Error resolving request:', error);
      return null;
    }
  }
};
