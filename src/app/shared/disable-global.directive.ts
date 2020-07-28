import { Directive, HostBinding } from '@angular/core';
import { SelectedDataService, SelectedData } from 'src/app/shared/services/selected-data.service';

@Directive({
  selector: '[appDisableGlobal]'
})
export class DisableGlobalDirective {
  @HostBinding('disabled') isEmpty: boolean = true;

  constructor(private selectedDataService: SelectedDataService) {
    this.selectedDataService.selectedChanges$.subscribe((data: SelectedData) => {
      this.isEmpty = !!!data.length;
    });
  }

}
