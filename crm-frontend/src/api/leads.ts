import { api } from "./client";

export type Lead = {
    id: string;
    inq_id: string;
    full_name: string;
    destination_country?: string;
    status?: string;
    field_of_study?: string;
    age?: number;
    visa_category?: string;
    principal? : string;
    gpa?: number;
    allocated_user_id: string;
    team?: string;
    whatsapp_no: string
    inquiry_date?: string;
    branch_name: string
};

export type LeadsListResponse = {
    leads: Lead[];
    total: number;
    limit: number;
    offset: number;
}

export type LeadCreate = {
    inq_id: string;
    full_name: string;
    destination_country?: string;
    status?: string;
    field_of_study?: string;
    age?: number;
    visa_category?: string;
    principal? : string;
    gpa?: number;
    allocated_user_id?: string;
    team?: string;
    inquiry_date?: string;
    branch: string;
    whatsapp_no: string;
}

export type LeadFilter = {
    status?: string;
    country?: string;
    allocated_user_id?: string;
    q?: string;
    from?: string;
    to?: string;
    limit?: number;
    offset?: number;
}

export const listLeads = (params: any) => {
    return api.get<LeadsListResponse>("/leads", { params }).then(r => r.data);
}

export const getLead = (id: string) => {
    return api.get<Lead>(`/leads/${id}`).then(r => r.data);
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

export const fetchLeads = async (filters: LeadFilter) => {
    const params = new URLSearchParams();

    if (filters.status) params.append("status", filters.status);
    if (filters.country) params.append("country", filters.country);
    if (filters.allocated_user_id) params.append("allocated_to", filters.allocated_user_id);
    if (filters.q) params.append("q", filters.q);
    if (filters.from) params.append("from", filters.from);
    if (filters.to) params.append("to", filters.to);
    params.set("limit", filters.limit?.toString() || "50");
    params.set("offset", filters.offset?.toString() || "0");

    const res = await api.get<LeadsListResponse>(`/leads?${params.toString()}`);
    return res.data;
}