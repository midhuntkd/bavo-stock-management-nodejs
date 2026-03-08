export const DEFAULT_PERMISSIONS = [
  { key: 'warehouse.view', description: 'View warehouses', group: 'warehouse' },
  { key: 'warehouse.create', description: 'Create warehouses', group: 'warehouse' },
  { key: 'warehouse.update', description: 'Update warehouses', group: 'warehouse' },
  { key: 'warehouse.delete', description: 'Deactivate warehouses', group: 'warehouse' },
  { key: 'stock.view', description: 'View stock items', group: 'stock' },
  { key: 'stock.create', description: 'Create stock items', group: 'stock' },
  { key: 'stock.update', description: 'Update stock items', group: 'stock' },
  { key: 'stock.in', description: 'Stock in operation', group: 'stock' },
  { key: 'stock.out', description: 'Stock out operation', group: 'stock' },
  { key: 'stock.adjust', description: 'Stock adjustment operation', group: 'stock' },
  { key: 'stock.transfer', description: 'Stock transfer operation', group: 'stock' },
  { key: 'stock.reserve', description: 'Reserve stock operation', group: 'stock' },
  { key: 'stock.release', description: 'Release stock operation', group: 'stock' },
  { key: 'stock-movement.view', description: 'View stock movement logs', group: 'stock-movement' },
  { key: 'admin-user.view', description: 'View admin users', group: 'admin-user' },
  { key: 'admin-user.create', description: 'Create admin users', group: 'admin-user' },
  { key: 'admin-user.update', description: 'Update admin users', group: 'admin-user' },
  { key: 'admin-user.delete', description: 'Deactivate admin users', group: 'admin-user' },
  { key: 'dashboard.view', description: 'View dashboard summary', group: 'dashboard' },
] as const;

export const PERMISSIONS = DEFAULT_PERMISSIONS.map((item) => item.key);
export type PermissionKey = (typeof PERMISSIONS)[number];
