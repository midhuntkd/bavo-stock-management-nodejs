export const roles = ['super_admin', 'admin', 'director'] as const;

export type Role = (typeof roles)[number];
