export interface PermissionSeed {
  name: string;
  code: string;
  module: string;
  description: string;
}

export const PERMISSION_SEEDS: PermissionSeed[] = [
  { name: 'Dashboard View', code: 'dashboard.view', module: 'dashboard', description: 'View dashboard summary' },
  { name: 'Accounting Dashboard View', code: 'accounting.dashboard.view', module: 'accounting', description: 'View accounting dashboard summary' },
  { name: 'User View', code: 'user.view', module: 'user', description: 'View users' },
  { name: 'User Create', code: 'user.create', module: 'user', description: 'Create users' },
  { name: 'User Update', code: 'user.update', module: 'user', description: 'Update users' },
  { name: 'User Delete', code: 'user.delete', module: 'user', description: 'Deactivate users' },
  { name: 'Role View', code: 'role.view', module: 'role', description: 'View roles' },
  { name: 'Role Create', code: 'role.create', module: 'role', description: 'Create roles' },
  { name: 'Role Update', code: 'role.update', module: 'role', description: 'Update roles' },
  { name: 'Role Delete', code: 'role.delete', module: 'role', description: 'Deactivate roles' },
  { name: 'Permission View', code: 'permission.view', module: 'permission', description: 'View permissions' },
  { name: 'Permission Assign', code: 'permission.assign', module: 'permission', description: 'Assign permissions' },

  { name: 'Warehouse View', code: 'warehouse.view', module: 'warehouse', description: 'View warehouses' },
  { name: 'Warehouse Create', code: 'warehouse.create', module: 'warehouse', description: 'Create warehouses' },
  { name: 'Warehouse Update', code: 'warehouse.update', module: 'warehouse', description: 'Update warehouses' },
  { name: 'Warehouse Delete', code: 'warehouse.delete', module: 'warehouse', description: 'Deactivate warehouses' },

  { name: 'Warehouse Location View', code: 'warehouse-location.view', module: 'warehouse-location', description: 'View warehouse locations' },
  { name: 'Warehouse Location Create', code: 'warehouse-location.create', module: 'warehouse-location', description: 'Create warehouse locations' },
  { name: 'Warehouse Location Update', code: 'warehouse-location.update', module: 'warehouse-location', description: 'Update warehouse locations' },
  { name: 'Warehouse Location Delete', code: 'warehouse-location.delete', module: 'warehouse-location', description: 'Deactivate warehouse locations' },

  { name: 'Supplier View', code: 'supplier.view', module: 'supplier', description: 'View suppliers' },
  { name: 'Supplier Create', code: 'supplier.create', module: 'supplier', description: 'Create suppliers' },
  { name: 'Supplier Update', code: 'supplier.update', module: 'supplier', description: 'Update suppliers' },
  { name: 'Supplier Delete', code: 'supplier.delete', module: 'supplier', description: 'Deactivate suppliers' },

  { name: 'Brand View', code: 'brand.view', module: 'brand', description: 'View brands' },
  { name: 'Brand Create', code: 'brand.create', module: 'brand', description: 'Create brands' },
  { name: 'Brand Update', code: 'brand.update', module: 'brand', description: 'Update brands' },
  { name: 'Brand Status', code: 'brand.status', module: 'brand', description: 'Activate/deactivate brands' },

  { name: 'Category View', code: 'category.view', module: 'category', description: 'View categories' },
  { name: 'Category Create', code: 'category.create', module: 'category', description: 'Create categories' },
  { name: 'Category Update', code: 'category.update', module: 'category', description: 'Update categories' },
  { name: 'Category Delete', code: 'category.delete', module: 'category', description: 'Update category status or mark deleted' },

  { name: 'Product View', code: 'product.view', module: 'product', description: 'View products' },
  { name: 'Product Create', code: 'product.create', module: 'product', description: 'Create products' },
  { name: 'Product Update', code: 'product.update', module: 'product', description: 'Update products' },
  { name: 'Product Delete', code: 'product.delete', module: 'product', description: 'Deactivate products' },
  { name: 'Product Sync', code: 'product.sync', module: 'product', description: 'Sync products from Bavo Admin' },

  { name: 'Stock View', code: 'stock.view', module: 'stock', description: 'View stock summary' },
  { name: 'Stock Create', code: 'stock.create', module: 'stock', description: 'Create stock summary record' },
  { name: 'Stock Update', code: 'stock.update', module: 'stock', description: 'Update stock summary' },
  { name: 'Stock In', code: 'stock.in', module: 'stock', description: 'Stock in operations' },
  { name: 'Stock Out', code: 'stock.out', module: 'stock', description: 'Stock out operations' },
  { name: 'Stock Reserve', code: 'stock.reserve', module: 'stock', description: 'Reserve stock' },
  { name: 'Stock Release', code: 'stock.release', module: 'stock', description: 'Release stock reservation' },
  { name: 'Stock Adjust', code: 'stock.adjust', module: 'stock', description: 'Adjust stock' },
  { name: 'Stock Transfer', code: 'stock.transfer', module: 'stock', description: 'Transfer stock between warehouses' },

  { name: 'Stock Movement View', code: 'stock-movement.view', module: 'stock-movement', description: 'View stock movement ledger' },
  { name: 'Stock Batch View', code: 'stock-batch.view', module: 'stock-batch', description: 'View stock batches' },

  { name: 'Purchase Order View', code: 'purchase-order.view', module: 'purchase-order', description: 'View purchase orders' },
  { name: 'Purchase Order Create', code: 'purchase-order.create', module: 'purchase-order', description: 'Create purchase orders' },
  { name: 'Purchase Order Update', code: 'purchase-order.update', module: 'purchase-order', description: 'Update purchase orders' },
  { name: 'Purchase Order Approve', code: 'purchase-order.approve', module: 'purchase-order', description: 'Approve purchase orders' },

  { name: 'GRN View', code: 'grn.view', module: 'grn', description: 'View GRN' },
  { name: 'GRN Create', code: 'grn.create', module: 'grn', description: 'Create GRN' },
  { name: 'GRN Update', code: 'grn.update', module: 'grn', description: 'Update/receive GRN' },

  { name: 'Sale Invoice View', code: 'sale-invoice.view', module: 'sale-invoice', description: 'View sale invoices' },
  { name: 'Sale Invoice Create', code: 'sale-invoice.create', module: 'sale-invoice', description: 'Create sale invoices' },
  { name: 'Sale Invoice Cancel', code: 'sale-invoice.cancel', module: 'sale-invoice', description: 'Cancel sale invoices' },

  { name: 'Stock Adjustment View', code: 'stock-adjustment.view', module: 'stock-adjustment', description: 'View stock adjustments' },
  { name: 'Stock Adjustment Create', code: 'stock-adjustment.create', module: 'stock-adjustment', description: 'Create stock adjustments' },
  { name: 'Stock Adjustment Approve', code: 'stock-adjustment.approve', module: 'stock-adjustment', description: 'Approve stock adjustments' },

  { name: 'Investment View', code: 'investment.view', module: 'investment', description: 'View investments' },
  { name: 'Investment Create', code: 'investment.create', module: 'investment', description: 'Create investments' },
  { name: 'Investment Update', code: 'investment.update', module: 'investment', description: 'Update investments' },
  { name: 'Investment Delete', code: 'investment.delete', module: 'investment', description: 'Delete draft investments' },
  { name: 'Investment Status', code: 'investment.status', module: 'investment', description: 'Confirm or cancel investments' },

  { name: 'Company Expense View', code: 'company-expense.view', module: 'company-expense', description: 'View company expenses' },
  { name: 'Company Expense Create', code: 'company-expense.create', module: 'company-expense', description: 'Create company expenses' },
  { name: 'Company Expense Update', code: 'company-expense.update', module: 'company-expense', description: 'Update company expenses' },
  { name: 'Company Expense Delete', code: 'company-expense.delete', module: 'company-expense', description: 'Delete draft company expenses' },
  { name: 'Company Expense Confirm', code: 'company-expense.confirm', module: 'company-expense', description: 'Confirm company expenses' },
  { name: 'Company Expense Cancel', code: 'company-expense.cancel', module: 'company-expense', description: 'Cancel company expenses' },

  { name: 'In Hand Amount View', code: 'in-hand-amount.view', module: 'in-hand-amount', description: 'View user in-hand amount records' },
  { name: 'In Hand Amount Create', code: 'in-hand-amount.create', module: 'in-hand-amount', description: 'Create user in-hand amount records' },
  { name: 'In Hand Amount Update', code: 'in-hand-amount.update', module: 'in-hand-amount', description: 'Update user in-hand amount records' },
  { name: 'In Hand Amount Delete', code: 'in-hand-amount.delete', module: 'in-hand-amount', description: 'Delete user in-hand amount records' },

  { name: 'Account View', code: 'account.view', module: 'account', description: 'View company accounts' },
  { name: 'Account Create', code: 'account.create', module: 'account', description: 'Create company accounts' },
  { name: 'Account Update', code: 'account.update', module: 'account', description: 'Update company accounts' },
  { name: 'Account Delete', code: 'account.delete', module: 'account', description: 'Deactivate company accounts' },

  { name: 'Account Transaction View', code: 'account-transaction.view', module: 'account-transaction', description: 'View account transactions' },
  { name: 'Account Transaction Create', code: 'account-transaction.create', module: 'account-transaction', description: 'Create account transactions' },
  { name: 'Account Transaction Update', code: 'account-transaction.update', module: 'account-transaction', description: 'Update manual account transactions' },
  { name: 'Account Transaction Delete', code: 'account-transaction.delete', module: 'account-transaction', description: 'Cancel manual account transactions' },

  { name: 'Personal Spend View', code: 'personal-spend.view', module: 'personal-spend', description: 'View personal company spends' },
  { name: 'Personal Spend Create', code: 'personal-spend.create', module: 'personal-spend', description: 'Create personal company spends' },
  { name: 'Personal Spend Update', code: 'personal-spend.update', module: 'personal-spend', description: 'Update personal company spends' },
  { name: 'Personal Spend Delete', code: 'personal-spend.delete', module: 'personal-spend', description: 'Delete personal company spends' },
  { name: 'Personal Spend Clear', code: 'personal-spend.clear', module: 'personal-spend', description: 'Clear personal spends through reimbursement' },
  { name: 'Personal Spend Extend', code: 'personal-spend.extend', module: 'personal-spend', description: 'Carry forward pending personal spends' },

  { name: 'Reimbursement View', code: 'reimbursement.view', module: 'reimbursement', description: 'View reimbursements' },
  { name: 'Reimbursement Create', code: 'reimbursement.create', module: 'reimbursement', description: 'Create reimbursements' },
  { name: 'Reimbursement Update', code: 'reimbursement.update', module: 'reimbursement', description: 'Update reimbursements' },
  { name: 'Reimbursement Approve', code: 'reimbursement.approve', module: 'reimbursement', description: 'Approve or cancel reimbursements' },

  { name: 'Monthly Summary View', code: 'monthly-summary.view', module: 'accounting', description: 'View monthly accounting summaries' },
];

export const PERMISSION_CODES = PERMISSION_SEEDS.map((permission) => permission.code);
