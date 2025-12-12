import { api } from "./client";

export type LeadNote = {
    id: string;
    lead_id: string;
    body: string;
    created_by: string;
    created_at: string;
}

export type LeadNoteList = {
    notes: LeadNote[];
    total_count: number;
    page: number;
    limit: number;
}

export type LeadNoteCreate = {
    body: string;
}

export type LeadNoteUpdate = {
    body: string;
}

export const listLeadNotes = (leadId: string) => {
    return api.get<LeadNoteList>(`/leads/${leadId}/notes`).then(r => r.data);
}

export const getLeadNote = (leadId: string, noteId: string) => {
    return api.get<LeadNote>(`/leads/${leadId}/notes/${noteId}`).then(r => r.data);
}

export const createLeadNote = (leadId: string, body: LeadNoteCreate) => {
    return api.post(`/leads/${leadId}/notes`, body).then(r => r.data);
}

export const updateLeadNote = (leadId: string, noteId: string, body: LeadNoteUpdate) => {
    return api.put(`/leads/${leadId}/notes/${noteId}`, body).then(r => r.data);
}

export const deleteLeadNote = (leadId: string, noteId: string) => {
    return api.delete(`/leads/${leadId}/notes/${noteId}`).then(r => r.data);
}