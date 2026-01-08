import swaggerJsdoc from 'swagger-jsdoc'

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Duaiii API Documentation',
      version: '1.5.0',
      description: 'منصة دوائي لتوصيل الأدوية - API Documentation',
      contact: {
        name: 'Duaiii Support',
        email: 'support@duaii.com',
        url: 'https://duaiinow.vercel.app',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://duaiinow.vercel.app',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
            },
            details: {
              type: 'object',
              description: 'Additional error details',
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Operation completed successfully',
            },
          },
        },
        Pharmacy: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            name: {
              type: 'string',
              example: 'صيدلية النهدي',
            },
            phone: {
              type: 'string',
              example: '0512345678',
            },
            latitude: {
              type: 'number',
              format: 'float',
              example: 24.7136,
            },
            longitude: {
              type: 'number',
              format: 'float',
              example: 46.6753,
            },
            is_verified: {
              type: 'boolean',
              example: true,
            },
            is_open: {
              type: 'boolean',
              example: true,
            },
            distance: {
              type: 'number',
              format: 'float',
              example: 2.5,
              description: 'Distance in kilometers',
            },
          },
        },
        Prescription: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            user_id: {
              type: 'string',
              format: 'uuid',
            },
            status: {
              type: 'string',
              enum: ['pending', 'accepted', 'rejected', 'ready', 'delivering', 'completed', 'cancelled'],
              example: 'pending',
            },
            notes: {
              type: 'string',
              example: 'ملاحظات إضافية',
            },
            images: {
              type: 'array',
              items: {
                type: 'string',
                format: 'url',
              },
            },
            created_at: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Notification: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            user_id: {
              type: 'string',
              format: 'uuid',
            },
            title: {
              type: 'string',
              example: 'طلب جديد',
            },
            message: {
              type: 'string',
              example: 'لديك طلب وصفة جديدة',
            },
            is_read: {
              type: 'boolean',
              example: false,
            },
            created_at: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication endpoints',
      },
      {
        name: 'Prescriptions',
        description: 'Prescription management',
      },
      {
        name: 'Pharmacies',
        description: 'Pharmacy information and search',
      },
      {
        name: 'Notifications',
        description: 'Push notifications management',
      },
      {
        name: 'Analytics',
        description: 'Analytics tracking',
      },
      {
        name: 'Health',
        description: 'System health checks',
      },
    ],
  },
  apis: ['./app/api/**/*.ts', './app/actions/**/*.ts'],
}

export const swaggerSpec = swaggerJsdoc(options)
