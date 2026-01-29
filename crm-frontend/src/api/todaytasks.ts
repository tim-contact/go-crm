import { api } from "./client";
import { type TaskStatus, type LeadTask } from "./leadtasks";

export type FollowUpCallTask = {
    lead_id: string;
    lead_name: string;
    lead_status?: string | null;
    last_follow_up_at?: string | null;
    due_at: string;
    allocated_to?: string | null;
};

export type TodayTasksResponse = {
    tasks: LeadTask[];
    follow_up_call_tasks: FollowUpCallTask[];
    total_tasks: number;
    total_follow_up_calls: number;
    limit: number;
    offset: number;
};

export type TodayTasksQuery = {
    assigned_to?: string;
    limit?: number;
    offset?: number;
};

export const getTodayTasks = async (params?: TodayTasksQuery) => {
    return api.get<TodayTasksResponse>("/tasks/today", { params }).then(r => r.data);
};

export type { TaskStatus };
