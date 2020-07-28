import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';

import { Observable, of } from 'rxjs';

@Injectable()
export class CustomPreloadingStrategy implements PreloadingStrategy {

  preload(route: Route, load: () => Observable<any>): Observable<any> {
    return route.data && route.data.preload && this.shouldPreload(route) ? load() : of(null);
  }

  shouldPreload(route: Route): boolean {
    // typescript doesn't have navigator types because it's not yet stable API
    const workAroundNavigator: any = navigator;
    // Get NetworkInformation object
    const conn = workAroundNavigator.connection;
    if (conn) {
      // Save-Data mode
      if (conn.saveData) {
        return false;
      }
      // 'slow-2g', '2g', '3g', or '4g'
      const effectiveType = conn.effectiveType || '';
      // 2G network
      if (effectiveType.includes('2g')) {
        return false;
      }
    }
    return true;
  }
}
