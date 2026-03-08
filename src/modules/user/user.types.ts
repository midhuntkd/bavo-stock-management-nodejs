import { Role } from '../../configs/roles';

export interface CreateAdminDTO {
  name: string;
  email: string;
  password: string;
  phone?: string;
  permissions?: string[];
}

export interface UpdateAdminDTO {
  name?: string;
  email?: string;
  phone?: string;
  permissions?: string[];
}

export interface UpdateAdminStatusDTO {
  isActive: boolean;
}

export interface ResetAdminPasswordDTO {
  password: string;
}

export interface SafeUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  permissions: string[];
  isActive: boolean;
  lastLoginAt?: Date;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}
