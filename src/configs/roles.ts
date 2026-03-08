export const roles = ['super_admin', 'admin'] as const;

export type Role = (typeof roles)[number];
