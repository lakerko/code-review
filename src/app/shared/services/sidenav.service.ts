import { Injectable, TemplateRef, ViewContainerRef } from '@angular/core';
import {
  ComponentPortal, ComponentType, Portal, TemplatePortal
} from '@angular/cdk/portal';
import { MatSidenav } from '@angular/material/sidenav';
import { from, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidenavService {
  panel: MatSidenav;
  private viewContainerRef: ViewContainerRef;
  private actionsPortal$ = new Subject<Portal<any>>();
  private warehousePortal$ = new Subject<Portal<any>>();

  /** Retrieves the current panel portal as an `Observable`. */
  get actionsPortal() {
    return from(this.actionsPortal$);
  }

  get warehousePortal() {
    return from(this.warehousePortal$);
  }

  /** Sets the view container ref needed for {@link #setPanelContent}. */
  setViewContainerRef(vcr: ViewContainerRef) {
    this.viewContainerRef = vcr;
  }

  /** Sets the panel portal to the specified portal. */
  setActionsPortal(actionsPortal: Portal<any>) {
    this.actionsPortal$.next(actionsPortal);
  }

  setWarehousePortal(warehousePortal: Portal<any>) {
    this.warehousePortal$.next(warehousePortal);
  }

  /**
   * Sets the panel content.
   * @param componentOrTemplateRef The component/template reference used.
   * @see PanelService#setActionsPortal
   */
  setPanelContent(componentOrTemplateRef: ComponentType<any> | TemplateRef<any>, target: 'actions' | 'warehouse' = 'actions') {
    let portal: Portal<any>;
    if (componentOrTemplateRef instanceof TemplateRef) {
      const vcr = this.viewContainerRef ? this.viewContainerRef : null;
      portal = new TemplatePortal(componentOrTemplateRef, vcr);
    } else {
      portal = new ComponentPortal(componentOrTemplateRef);
    }
    if (target === 'actions') {
      this.actionsPortal$.next(portal);
    } else if (target === 'warehouse') {
      this.warehousePortal$.next(portal);
    }
  }

  /** Resets the current panel portal. */
  clearActionsPortal() {
    this.actionsPortal$.next(null);
  }

  clearWarehousePortal() {
    this.warehousePortal$.next(null);
  }
}
