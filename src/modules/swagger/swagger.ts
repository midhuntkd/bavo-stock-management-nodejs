import swaggerJSDoc from 'swagger-jsdoc';
import config from '../../configs/config';

const swaggerServerUrl = config.appBaseUrl.replace(/\/+$/, '').endsWith('/api/v1')
  ? config.appBaseUrl.replace(/\/+$/, '')
  : `${config.appBaseUrl.replace(/\/+$/, '')}/api/v1`;

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Bavo Stock API',
      version: '1.0.0',
      description: 'Production-grade quick-commerce warehouse API',
    },
    servers: [
      {
        url: swaggerServerUrl,
      },
    ],
    paths: {
      '/auth/login': { post: { tags: ['Auth'], summary: 'Login' } },
      '/auth/refresh-tokens': { post: { tags: ['Auth'], summary: 'Refresh tokens' } },
      '/auth/logout': { post: { tags: ['Auth'], summary: 'Logout' } },
      '/auth/me': { get: { tags: ['Auth'], summary: 'Get profile' } },
      '/auth/change-password': { post: { tags: ['Auth'], summary: 'Change own password' } },
      '/admin-users': {
        get: { tags: ['Users'], summary: 'List users' },
        post: { tags: ['Users'], summary: 'Create user' },
      },
      '/admin-users/{id}': {
        get: { tags: ['Users'], summary: 'Get user' },
        patch: { tags: ['Users'], summary: 'Update user' },
      },
      '/admin-users/{id}/password': { patch: { tags: ['Users'], summary: 'Reset user password' } },
      '/roles': { get: { tags: ['Roles'], summary: 'List roles' }, post: { tags: ['Roles'], summary: 'Create role' } },
      '/roles/{id}': { get: { tags: ['Roles'], summary: 'Get role' }, patch: { tags: ['Roles'], summary: 'Update role' } },
      '/roles/{id}/permissions': { patch: { tags: ['Roles'], summary: 'Set role permissions' } },
      '/permissions': {
        get: { tags: ['Permissions'], summary: 'List permissions' },
        post: { tags: ['Permissions'], summary: 'Create permission' },
      },
      '/permissions/{id}': { patch: { tags: ['Permissions'], summary: 'Update permission' } },
      '/accounts': {
        get: { tags: ['Accounting'], summary: 'List accounts' },
        post: { tags: ['Accounting'], summary: 'Create account' },
      },
      '/accounts/summary': { get: { tags: ['Accounting'], summary: 'Account summaries' } },
      '/accounts/{id}': { get: { tags: ['Accounting'], summary: 'Account detail' }, patch: { tags: ['Accounting'], summary: 'Update account' } },
      '/accounts/{id}/statement': { get: { tags: ['Accounting'], summary: 'Account statement' } },
      '/accounts/{id}/status': { patch: { tags: ['Accounting'], summary: 'Activate or deactivate account' } },
      '/account-transactions': {
        get: { tags: ['Accounting'], summary: 'List account transactions' },
        post: { tags: ['Accounting'], summary: 'Create account transaction' },
      },
      '/account-transactions/{id}': {
        get: { tags: ['Accounting'], summary: 'Account transaction detail' },
        patch: { tags: ['Accounting'], summary: 'Update account transaction' },
      },
      '/account-transactions/{id}/cancel': { patch: { tags: ['Accounting'], summary: 'Cancel account transaction' } },
      '/investments': {
        get: { tags: ['Accounting'], summary: 'List investments' },
        post: { tags: ['Accounting'], summary: 'Create investment' },
      },
      '/investments/summary': { get: { tags: ['Accounting'], summary: 'Investment summary' } },
      '/investments/{id}': { get: { tags: ['Accounting'], summary: 'Investment detail' }, patch: { tags: ['Accounting'], summary: 'Update investment' } },
      '/investments/{id}/confirm': { patch: { tags: ['Accounting'], summary: 'Confirm investment' } },
      '/investments/{id}/cancel': { patch: { tags: ['Accounting'], summary: 'Cancel investment' } },
      '/company-expenses': {
        get: { tags: ['Accounting'], summary: 'List company expenses' },
        post: { tags: ['Accounting'], summary: 'Create company expense' },
      },
      '/company-expenses/{id}': {
        get: { tags: ['Accounting'], summary: 'Company expense detail' },
        patch: { tags: ['Accounting'], summary: 'Update company expense' },
        delete: { tags: ['Accounting'], summary: 'Delete draft company expense' },
      },
      '/company-expenses/{id}/confirm': { patch: { tags: ['Accounting'], summary: 'Confirm company expense' } },
      '/company-expenses/{id}/cancel': { patch: { tags: ['Accounting'], summary: 'Cancel company expense' } },
      '/personal-spends': {
        get: { tags: ['Accounting'], summary: 'List personal spends' },
        post: { tags: ['Accounting'], summary: 'Create personal spend' },
      },
      '/personal-spends/{id}': { get: { tags: ['Accounting'], summary: 'Personal spend detail' }, patch: { tags: ['Accounting'], summary: 'Update personal spend' }, delete: { tags: ['Accounting'], summary: 'Delete personal spend' } },
      '/personal-spends/{id}/carry-forward': { patch: { tags: ['Accounting'], summary: 'Carry forward personal spend' } },
      '/reimbursements': {
        get: { tags: ['Accounting'], summary: 'List reimbursements' },
        post: { tags: ['Accounting'], summary: 'Create reimbursement' },
      },
      '/reimbursements/monthly-history': { get: { tags: ['Accounting'], summary: 'Monthly reimbursement history' } },
      '/reimbursements/{id}': { get: { tags: ['Accounting'], summary: 'Reimbursement detail' }, patch: { tags: ['Accounting'], summary: 'Update reimbursement' } },
      '/reimbursements/{id}/cancel': { patch: { tags: ['Accounting'], summary: 'Cancel reimbursement' } },
      '/accounting/dashboard': { get: { tags: ['Accounting'], summary: 'Accounting dashboard summary' } },
      '/accounting/monthly-summary': { get: { tags: ['Accounting'], summary: 'Monthly accounting summary' } },
      '/accounting/user-summary/{userId}': { get: { tags: ['Accounting'], summary: 'User accounting summary' } },
      '/warehouses': {
        get: { tags: ['Warehouses'], summary: 'List warehouses' },
        post: { tags: ['Warehouses'], summary: 'Create warehouse' },
      },
      '/warehouses/{id}': {
        get: { tags: ['Warehouses'], summary: 'Warehouse detail' },
        patch: { tags: ['Warehouses'], summary: 'Update warehouse' },
      },
      '/warehouses/{id}/status': { patch: { tags: ['Warehouses'], summary: 'Activate/deactivate warehouse' } },
      '/warehouse-locations': {
        get: { tags: ['Warehouse Locations'], summary: 'List locations' },
        post: { tags: ['Warehouse Locations'], summary: 'Create location' },
      },
      '/warehouse-locations/{id}': { patch: { tags: ['Warehouse Locations'], summary: 'Update location' } },
      '/warehouse-locations/{id}/status': { patch: { tags: ['Warehouse Locations'], summary: 'Activate/deactivate location' } },
      '/suppliers': { get: { tags: ['Suppliers'], summary: 'List suppliers' }, post: { tags: ['Suppliers'], summary: 'Create supplier' } },
      '/suppliers/{id}': { get: { tags: ['Suppliers'], summary: 'Supplier detail' }, patch: { tags: ['Suppliers'], summary: 'Update supplier' } },
      '/suppliers/{id}/status': { patch: { tags: ['Suppliers'], summary: 'Activate/deactivate supplier' } },
      '/brands': { get: { tags: ['Brands'], summary: 'List brands' }, post: { tags: ['Brands'], summary: 'Create brand' } },
      '/brands/options': { get: { tags: ['Brands'], summary: 'Brand options' } },
      '/brands/by-supplier/{supplierId}': { get: { tags: ['Brands'], summary: 'List brands by supplier' } },
      '/brands/{id}': { get: { tags: ['Brands'], summary: 'Brand detail' }, patch: { tags: ['Brands'], summary: 'Update brand' } },
      '/brands/{id}/status': { patch: { tags: ['Brands'], summary: 'Activate/deactivate brand' } },
      '/categories': { get: { tags: ['Categories'], summary: 'List categories' }, post: { tags: ['Categories'], summary: 'Create category' } },
      '/categories/{id}': { get: { tags: ['Categories'], summary: 'Category detail' }, patch: { tags: ['Categories'], summary: 'Update category' } },
      '/categories/{id}/status': { patch: { tags: ['Categories'], summary: 'Update category status' } },
      '/products': { get: { tags: ['Products'], summary: 'List products' }, post: { tags: ['Products'], summary: 'Create product' } },
      '/products/{id}': { get: { tags: ['Products'], summary: 'Product detail' }, patch: { tags: ['Products'], summary: 'Update product' } },
      '/products/{id}/status': { patch: { tags: ['Products'], summary: 'Activate/deactivate product' } },
      '/stocks': { get: { tags: ['Stock'], summary: 'List stock summary' }, post: { tags: ['Stock'], summary: 'Create stock summary' } },
      '/stocks/{id}': { get: { tags: ['Stock'], summary: 'Stock detail' } },
      '/stocks/low-stock/list': { get: { tags: ['Stock'], summary: 'Low stock list' } },
      '/stock-batches': { get: { tags: ['Stock Batch'], summary: 'List stock batches' } },
      '/stock-batches/{id}': { get: { tags: ['Stock Batch'], summary: 'Stock batch detail' } },
      '/stock-batches/{id}/status': { patch: { tags: ['Stock Batch'], summary: 'Mark batch status' } },
      '/stock-reservations': {
        get: { tags: ['Stock Reservation'], summary: 'List reservations' },
        post: { tags: ['Stock Reservation'], summary: 'Reserve stock' },
      },
      '/stock-reservations/{id}/release': { patch: { tags: ['Stock Reservation'], summary: 'Release reservation' } },
      '/stock-reservations/{id}/consume': { patch: { tags: ['Stock Reservation'], summary: 'Consume reservation' } },
      '/stock-movements': { get: { tags: ['Stock Movement'], summary: 'List movements' } },
      '/stock-movements/{id}': { get: { tags: ['Stock Movement'], summary: 'Movement detail' } },
      '/purchase-orders': {
        get: { tags: ['Purchase Order'], summary: 'List purchase orders' },
        post: { tags: ['Purchase Order'], summary: 'Create purchase order' },
      },
      '/purchase-orders/{id}': {
        get: { tags: ['Purchase Order'], summary: 'PO detail' },
        patch: { tags: ['Purchase Order'], summary: 'Update draft PO' },
      },
      '/purchase-orders/{id}/approve': { patch: { tags: ['Purchase Order'], summary: 'Approve PO' } },
      '/purchase-orders/{id}/cancel': { patch: { tags: ['Purchase Order'], summary: 'Cancel PO' } },
      '/grn': { get: { tags: ['GRN'], summary: 'List GRN' }, post: { tags: ['GRN'], summary: 'Create GRN' } },
      '/grn/{id}': { get: { tags: ['GRN'], summary: 'GRN detail' } },
      '/grn/{id}/receive': { patch: { tags: ['GRN'], summary: 'Receive GRN' } },
      '/grn/{id}/cancel': { patch: { tags: ['GRN'], summary: 'Cancel GRN' } },
      '/stock-transfers': {
        get: { tags: ['Stock Transfer'], summary: 'List transfers' },
        post: { tags: ['Stock Transfer'], summary: 'Create transfer' },
      },
      '/stock-transfers/{id}': { get: { tags: ['Stock Transfer'], summary: 'Transfer detail' } },
      '/stock-transfers/{id}/dispatch': { patch: { tags: ['Stock Transfer'], summary: 'Dispatch transfer' } },
      '/stock-transfers/{id}/receive': { patch: { tags: ['Stock Transfer'], summary: 'Receive transfer' } },
      '/stock-transfers/{id}/cancel': { patch: { tags: ['Stock Transfer'], summary: 'Cancel transfer' } },
      '/sale-invoices': { get: { tags: ['Sale Invoice'], summary: 'List invoices' }, post: { tags: ['Sale Invoice'], summary: 'Create draft invoice' } },
      '/sale-invoices/{id}': { get: { tags: ['Sale Invoice'], summary: 'Invoice detail' } },
      '/sale-invoices/{id}/confirm': { patch: { tags: ['Sale Invoice'], summary: 'Confirm invoice' } },
      '/sale-invoices/{id}/cancel': { patch: { tags: ['Sale Invoice'], summary: 'Cancel invoice' } },
      '/stock-adjustments': {
        get: { tags: ['Stock Adjustment'], summary: 'List adjustments' },
        post: { tags: ['Stock Adjustment'], summary: 'Create adjustment' },
      },
      '/stock-adjustments/{id}': { get: { tags: ['Stock Adjustment'], summary: 'Adjustment detail' } },
      '/stock-adjustments/{id}/apply': { patch: { tags: ['Stock Adjustment'], summary: 'Apply adjustment' } },
      '/dashboard/summary': { get: { tags: ['Dashboard'], summary: 'Dashboard summary' } },
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['src/routes/*.ts'],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
