import { api } from "./client";

export type UserListItem = {
  id: string;
  name: string;
  role: string;
  active: boolean;
};

export type UsersListResponse = {
  users: UserListItem[];
  total: number;
};

export const listUsers = async () => {
  return api.get<UsersListResponse>("/users").then((r) => r.data);
};
