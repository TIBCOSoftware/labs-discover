import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve} from '@angular/router';
import {BehaviorSubject, Observable, fromEvent, never, of} from 'rxjs';
import {flatMap, map} from 'rxjs/operators';
import {SpotfireAuthResolver} from '@tibco-tcstk/tc-spotfire-lib';
import { ConfigurationService } from '../service/configuration.service';

@Injectable()
export class DiscSpotfireAuthResolver extends SpotfireAuthResolver {

  constructor(protected configService: ConfigurationService) {
    super();
  }

  resolve(routeSnapshot: ActivatedRouteSnapshot): Observable<any> {
    if (this.configService && this.configService.config && this.configService.config.discover && this.configService.config.discover.analytics && this.configService.config.discover.analytics.useCustomServer) {
      return of(true);
    } else {
      super.resolve(routeSnapshot);
    }
  }
}
