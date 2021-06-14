import { Response } from 'koa';
import { Get, JsonController, Res } from 'routing-controllers';
import { Service } from 'typedi';

@Service()
@JsonController()
export class HealthCheckController {

  constructor (
  ){}

  @Get('/alive')
  async alive(@Res() response: Response) {
    response.status = 200;
    response.body = {
      status: 'UP'
    };
    return response;
  }

  @Get('/ready')
  async ready(@Res() response: Response) {
    response.status = 200;
    response.body = {
      status: 'UP'
    };
    return response;
  }
  
}