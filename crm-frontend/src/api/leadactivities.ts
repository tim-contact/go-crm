import {api} from "./client";

export const ActivityKind = {
    CALL: "call",
    FOLLOW_UP: "follow_up_call",
    EMAIL: "email",
    MEETING: "meeting",
    WHATSAPP: "whatsapp",
    NOTE: "note",
} as const;

export type ActivityKind = typeof ActivityKind[keyof typeof ActivityKind];

export type LeadActivity = {
    id: string;
    lead_id: string;
    staff_id?: string;
    kind: ActivityKind;
    summary?: string;
    occurred_at: string;

}

export type LeadActivityList = {
    activities: LeadActivity[];
    total_count: number;
    page: number;
    limit: number;
}


export type LeadActivityCreate = {
    kind: ActivityKind;
    summary?: string;
}

export type LeadActivityUpdate = {
    summary?: string;
}

export const listLeadActivities = (leadId : string) => {
    return api.get<LeadActivityList>(`/leads/${leadId}/activities`).then(r => r.data);
}

export const getLeadActivity = (leadId: string, activityId: string) => {
    return api.get<LeadActivity>(`/leads/${leadId}/activities/${activityId}`).then(r => r.data);
}

export const createLeadActivity = (leadId: string, body: LeadActivityCreate) => {
    return api.post(`/leads/${leadId}/activities`, body).then(r => r.data);
}

export const updateLeadActivity = (leadId: string, activityId: string, body: LeadActivityUpdate) => {
    return api.put(`/leads/${leadId}/activities/${activityId}`, body).then(r => r.data);
}

export const deleteLeadActivity = (leadId: string, activityId: string) => {
    return api.delete(`/leads/${leadId}/activities/${activityId}`).then(r => r.data);
}