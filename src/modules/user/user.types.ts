export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  phone?: string;
  roleCode: string;
  permissions?: string[];
  permissionsCsv?: string;
  isActive?: boolean;
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  password?: string | null;
  phone?: string;
  roleCode?: string;
  permissions?: string[];
  permissionsCsv?: string;
  isActive?: boolean;
}

export interface ResetPasswordDTO {
  password: string;
}

export interface ResetPasswordByEmailDTO {
  email: string;
}

export interface ChangePasswordDTO {
  previousPassword?: string;
  currentPassword: string;
  newPassword?: string;
}
