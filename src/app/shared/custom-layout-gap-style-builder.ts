import { Injectable } from '@angular/core';
import {
  StyleDefinition,
  LayoutGapParent,
  LayoutGapStyleBuilder,
} from '@angular/flex-layout';

@Injectable()
export class CustomLayoutGapStyleBuilder extends LayoutGapStyleBuilder {

  buildStyles(gapValue: string, parent: LayoutGapParent): StyleDefinition {
    return super.buildStyles(gapValue || '0 px', parent);
  }

  sideEffect(gapValue, applyStyles, parent) {
    return super.sideEffect(gapValue || '0 px', applyStyles, parent);
  }

}
