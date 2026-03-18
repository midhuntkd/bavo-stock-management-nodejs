export const SYSTEM_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  DIRECTOR: 'director',
  STAFF: 'staff',
} as const;

export const ROLE_CODES = Object.values(SYSTEM_ROLES);

export type SystemRoleCode = (typeof ROLE_CODES)[number];
