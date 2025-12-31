import {api} from "./client";

export const TaskStatus = { 
    OPEN: 'open',
    IN_PROGRESS: 'in_progress',
    DONE: 'done',
    CANCELLED: 'cancelled'
} as const;

export type TaskStatus = typeof TaskStatus[keyof typeof TaskStatus];

export type LeadTask = {
    id: string;
    lead_id: string;
    title: string;
    due_date?: string | null;
    status: TaskStatus;
    assigned_to?: string | null;
    created_at: string;
}

export type LeadTaskList = {
    tasks: LeadTask[];
    total_count: number;
}

export type LeadTaskCreate = {
     title: string;
     due_date?: string | null;
     status: TaskStatus;
     assigned_to?: string | null;
}

export type LeadTaskUpdate = {
    title?: string;
    due_date?: string | null;
    status?: TaskStatus;
    assigned_to?: string | null;
}

export const listLeadTasks = async (leadId: string) => {
    return api.get<LeadTaskList>(`/leads/${leadId}/tasks`).then(r => r.data);
}

export const getLeadTask = async (leadId: string, taskId: string) => {
    return api.get<LeadTask>(`/leads/${leadId}/tasks/${taskId}`).then(r => r.data);
}

export const createLeadTask = async (leadId: string, body: LeadTaskCreate) => {
    return api.post(`/leads/${leadId}/tasks`, body).then(r => r.data);
}

export const updateLeadTask = (leadId: string, taskId: string, body: LeadTaskUpdate) => {
    return api.put(`/leads/${leadId}/tasks/${taskId}`, body).then(r => r.data);
}

export const deleteLeadTask = (leadId: string, taskId: string) => {
    return api.delete(`/leads/${leadId}/tasks/${taskId}`).then(r => r.data);
}