import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';

import { DialogService } from 'src/app/shared/services/dialog.service';
import { otherTechnicalStuffsService } from 'src/app/shared/services/otherTechnicalStuffs.service';

import { PdfExtracterComponent } from '../pdf-extracter/pdf-extracter.component';
import { AddtechnicalStuffsDialogComponent } from 'src/app/presents/add-technicalStuffs-dialog/add-technicalStuffs-dialog.component';

@Component({
  selector: 'app-pdf-to-technicalStuff-creator',
  templateUrl: './pdf-to-technicalStuff-creator.component.html',
  styleUrls: ['./pdf-to-technicalStuff-creator.component.scss']
})
export class PdfTotechnicalStuffCreatorComponent implements OnInit {
  @ViewChild('pdfExtractor') pdfExtractorRef: PdfExtracterComponent;
  @Output() pdfExtracted = new EventEmitter();

  public newtechnicalStuffs = [];

  constructor(
    private dialog: MatDialog,
    private dialogService: DialogService,
    private otherTechnicalStuffsService: otherTechnicalStuffsService,
  ) { }

  ngOnInit() {
  }

  onTextExtract(event) {
    this.newtechnicalStuffs = [];
    event.forEach(textPage => {
      const otherTechnicalStuffsList = this.extractotherTechnicalStuffList(textPage.trimedStringSegments);
      const technicalStuffsList = this.extracttechnicalStuffsFromString(textPage.finalString);
      const otherTechnicalStufftechnicalStuffList = this.createotherTechnicalStufftechnicalStuffList(technicalStuffsList, otherTechnicalStuffsList);
      this.newtechnicalStuffs.push(...this.convertotherTechnicalStufftechnicalStuffTotechnicalStuffotherTechnicalStuffList(otherTechnicalStufftechnicalStuffList));
    });
    if (this.newtechnicalStuffs.length) {
      const dialogRef = this.dialog.open(AddtechnicalStuffsDialogComponent, {
        width: '800px',
        data: {
          newtechnicalStuffs: JSON.parse(JSON.stringify(this.newtechnicalStuffs)),
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
        console.log('The dialog was closed', result);
        this.removeAlltechnicalStuffs();
        this.pdfExtracted.emit(result);
      });
    } else {
      this.dialogService.openSnackBar(`Neboli nájdené žiadne valídne technicalStuff`, 10000);
    }
  }

  convertotherTechnicalStufftechnicalStuffTotechnicalStuffotherTechnicalStuffList(otherTechnicalStufftechnicalStuffList) {
    const technicalStuffotherTechnicalStuffList = [];
    for (const otherTechnicalStuff of Object.keys(otherTechnicalStufftechnicalStuffList)) {
      otherTechnicalStufftechnicalStuffList[otherTechnicalStuff].forEach((technicalStuff, index) => {
        technicalStuffotherTechnicalStuffList.push({
          idx: index,
          technicalStuff,
          otherTechnicalStuffValue: otherTechnicalStuff,
          otherTechnicalStuffDisplay: this.otherTechnicalStuffsService.getotherTechnicalStuffLabel(otherTechnicalStuff),
          type: this.otherTechnicalStuffsService.getTypeFromotherTechnicalStuff(otherTechnicalStuff),
          isSelected: true,
        });
      });
    }
    return technicalStuffotherTechnicalStuffList;
  }

  createotherTechnicalStufftechnicalStuffList(technicalStuffsList, otherTechnicalStuffsList) {
    if (otherTechnicalStuffsList.length !== technicalStuffsList.length) {
      console.warn('neco je na kokot');
      return;
    }

    const otherTechnicalStuffKeytechnicalStuffsValue = {};
    otherTechnicalStuffsList.forEach((otherTechnicalStuff, index) => {
      otherTechnicalStuffKeytechnicalStuffsValue[otherTechnicalStuff] = technicalStuffsList[index].split(',').map(technicalStuff => technicalStuff.trim());
    });
    return otherTechnicalStuffKeytechnicalStuffsValue;
  }

  extractotherTechnicalStuffList(originSegments): string[] {
    const otherTechnicalStuffList = [];
    originSegments.forEach((segment, index) => {
      if (segment === 'KS') {
        otherTechnicalStuffList.push(originSegments[index + 1]);
      }
    });
    return otherTechnicalStuffList;
  }

  extracttechnicalStuffsFromString(originString): string[][] {
    let start = 0;
    const listOftechnicalStuffs = [];
    const targetString = 'Sér.čís.:(';
    while (start !== -1 && start < originString.length) {
      const boundryStart = originString.indexOf(targetString, start);
      if (boundryStart !== -1) {
        const boundryEnd = originString.indexOf(')', boundryStart);
        listOftechnicalStuffs.push(originString.substring(boundryStart + targetString.length, boundryEnd).trim());
        start = boundryEnd + 1;
      } else {
        start = boundryStart;
      }
    }
    return listOftechnicalStuffs;
  }

  removeAlltechnicalStuffs() {
    this.pdfExtractorRef.removeAll();
    this.newtechnicalStuffs = [];
  }

}
