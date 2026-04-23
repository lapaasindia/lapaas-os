// Escalation Matrix Service

import { EscalationEvent, EscalationStats, RoutingDecision, RequestUrgency, EscalationRoute, DEFAULT_ESCALATION_RULES } from '../types/escalation';

const API_BASE = 'http://localhost:3000/api/v1';

export const escalationService = {
  // Get escalation rule for urgency
  getRule: (urgency: RequestUrgency) => {
    return DEFAULT_ESCALATION_RULES[urgency];
  },

  // Determine routing for request
  async determineRoute(requestId: string, urgency: RequestUrgency, context?: any): Promise<RoutingDecision> {
    try {
      const response = await fetch(`${API_BASE}/escalation/determine-route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, urgency, context })
      });

      if (response.ok) {
        const data = await response.json();
        return data.data;
      }

      // Fallback to default rule
      const rule = DEFAULT_ESCALATION_RULES[urgency];
      return {
        requestId,
        urgency,
        recommendedRoute: rule.routeTo,
        requiresJustification: rule.requiresJustification,
        reason: `Default routing for ${urgency}`
      };
    } catch (error) {
      console.error('Error determining route:', error);
      const rule = DEFAULT_ESCALATION_RULES[urgency];
      return {
        requestId,
        urgency,
        recommendedRoute: rule.routeTo,
        requiresJustification: rule.requiresJustification,
        reason: 'Default routing'
      };
    }
  },

  // Escalate request
  async escalateRequest(
    requestId: string,
    fromRoute: EscalationRoute,
    toRoute: EscalationRoute,
    reason: string,
    userId: string
  ): Promise<EscalationEvent | null> {
    try {
      const response = await fetch(`${API_BASE}/escalation/escalate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, fromRoute, toRoute, reason, userId })
      });

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

  // Get escalation history
  async getEscalationHistory(requestId: string): Promise<EscalationEvent[]> {
    try {
      const response = await fetch(`${API_BASE}/escalation/history/${requestId}`);
      if (response.ok) {
        const data = await response.json();
        return data.data || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching escalation history:', error);
      return [];
    }
  },

  // Get escalation statistics
  async getEscalationStats(orgId: string, startDate?: string, endDate?: string): Promise<EscalationStats | null> {
    try {
      let url = `${API_BASE}/escalation/statistics?org_id=${orgId}`;
      if (startDate) url += `&start_date=${startDate}`;
      if (endDate) url += `&end_date=${endDate}`;

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        return data.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching escalation stats:', error);
      return null;
    }
  },

  // Check if P1 requires justification
  requiresJustification: (urgency: RequestUrgency): boolean => {
    return DEFAULT_ESCALATION_RULES[urgency].requiresJustification;
  },

  // Get escalation path for urgency
  getEscalationPath: (urgency: RequestUrgency): EscalationRoute[] => {
    const paths: Record<RequestUrgency, EscalationRoute[]> = {
      P1: ['faq', 'office_hours', 'manager', 'founder'],
      P2: ['faq', 'office_hours', 'manager'],
      P3: ['faq', 'office_hours'],
      P4: ['faq']
    };
    return paths[urgency];
  },

  // Auto-route request
  async autoRoute(requestId: string, urgency: RequestUrgency): Promise<EscalationRoute> {
    try {
      const decision = await this.determineRoute(requestId, urgency);
      return decision.recommendedRoute;
    } catch (error) {
      console.error('Error auto-routing:', error);
      return DEFAULT_ESCALATION_RULES[urgency].routeTo;
    }
  },

  // Check diversion rate
  async checkDivertionRate(orgId: string): Promise<number> {
    try {
      const stats = await this.getEscalationStats(orgId);
      if (!stats) return 0;
      return Math.round((stats.divertedFromFounder / stats.totalEscalations) * 100);
    } catch (error) {
      console.error('Error checking diversion rate:', error);
      return 0;
    }
  },

  // Get requests pending escalation
  async getPendingEscalations(orgId: string): Promise<any[]> {
    try {
      const response = await fetch(
        `${API_BASE}/escalation/pending?org_id=${orgId}`
      );
      if (response.ok) {
        const data = await response.json();
        return data.data || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching pending escalations:', error);
      return [];
    }
  },

  // Approve escalation
  async approveEscalation(escalationId: string, approvedBy: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${API_BASE}/escalation/${escalationId}/approve`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ approvedBy })
        }
      );
      return response.ok;
    } catch (error) {
      console.error('Error approving escalation:', error);
      return false;
    }
  },

  // Reject escalation
  async rejectEscalation(escalationId: string, reason: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${API_BASE}/escalation/${escalationId}/reject`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason })
        }
      );
      return response.ok;
    } catch (error) {
      console.error('Error rejecting escalation:', error);
      return false;
    }
  }
};
