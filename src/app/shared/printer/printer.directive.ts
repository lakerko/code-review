import { Directive, HostListener } from '@angular/core';

import { PrintService } from './print.service';

import * as es6printJS from 'print-js';
const printJS = require('print-js');

@Directive({
  selector: '[appPrinter]'
})
export class PrinterDirective {
  @HostListener('click')
  onClick() {
    es6printJS(this.printService.getPrintDefinition());
  }


  constructor(private printService: PrintService) {}

}
