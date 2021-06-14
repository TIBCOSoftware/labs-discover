import { koaSwagger } from 'koa2-swagger-ui';

export function setupSwagger(app: any) {

  app.use(
    koaSwagger({
      swaggerOptions: {
        url: `/docs/swagger.json`,
      },
    }),
  );
}

