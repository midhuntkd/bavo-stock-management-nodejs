export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  phone?: string;
  roleCode: string;
  permissions?: string[];
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  phone?: string;
  roleCode?: string;
  permissions?: string[];
  isActive?: boolean;
}

export interface ResetPasswordDTO {
  password: string;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
}
