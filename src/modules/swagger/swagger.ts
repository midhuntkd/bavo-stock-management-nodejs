import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Bavo Stock API',
      version: '1.0.0',
      description: 'Production-grade quick-commerce warehouse API',
    },
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
