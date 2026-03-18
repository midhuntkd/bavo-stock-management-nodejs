export const ROLE_LIST = ['super_admin', 'admin', 'director'] as const;
export type RoleKey = (typeof ROLE_LIST)[number];
