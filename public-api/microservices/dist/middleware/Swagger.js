"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = void 0;
const koa2_swagger_ui_1 = require("koa2-swagger-ui");
function setupSwagger(app) {
    app.use(koa2_swagger_ui_1.koaSwagger({
        routePrefix: '/swagger',
        swaggerOptions: {
            url: './docs/api.yaml',
        },
    }));
}
exports.setupSwagger = setupSwagger;
//# sourceMappingURL=Swagger.js.map