import { PERMISSION_CODES } from './permissions';

export const ROLE_SEEDS = [
  { name: 'Super Admin', code: 'super_admin', description: 'System super admin', isSystem: true },
  { name: 'Admin', code: 'admin', description: 'Warehouse admin', isSystem: true },
  { name: 'Staff', code: 'staff', description: 'Warehouse operations staff', isSystem: true },
] as const;

export const ROLE_PERMISSION_MAP: Record<string, string[]> = {
  super_admin: PERMISSION_CODES,
  admin: PERMISSION_CODES.filter((code) => !code.startsWith('role.') && !code.startsWith('permission.')),
  staff: [
    'dashboard.view',
    'warehouse.view',
    'brand.view',
    'warehouse-location.view',
    'supplier.view',
    'product.view',
    'stock.view',
    'stock.reserve',
    'stock.release',
    'stock.transfer',
    'stock-movement.view',
    'stock-batch.view',
    'purchase-order.view',
    'grn.view',
    'sale-invoice.view',
    'sale-invoice.create',
    'stock-adjustment.view',
  ],
};
