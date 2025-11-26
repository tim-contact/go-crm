import { api } from "./client";

export type Lead = {
    id: string;
    full_name: string;
    destination_country?: string;
    status?: string;
    inquiry_date?: string;
    branch?: string
};

export type LeadCreate = {
    full_name: string;
    destination_country?: string;
    status?: string;
    inquiry_date?: string;
    branch: string;
}

export const listLeads = (params: any) => {
    return api.get<Lead[]>("/leads", { params }).then(r => r.data);
}

export const createLead = (body: LeadCreate) => {
    return api.post("/leads", body).then(r => r.data);
}

export const updateLead = (id: string, body: Partial<LeadCreate>) => {
    return api.put(`/leads/${id}`, body).then(r => r.data);
}

export const deleteLead = (id: string) => {
   return api.delete(`/leads/${id}`).then(r => r.data);
}