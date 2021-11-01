import { koaSwagger } from 'koa2-swagger-ui';

export function setupSwagger(app: any) {

  app.use(
    koaSwagger({
      routePrefix: '/swagger', 
      swaggerOptions: {
        url: './docs/api.yaml', 
      },
    }),
  );
}

