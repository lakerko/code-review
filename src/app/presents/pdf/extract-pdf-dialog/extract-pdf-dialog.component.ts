import { Component, OnInit } from '@angular/core';

import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-extract-pdf-dialog',
  templateUrl: './extract-pdf-dialog.component.html',
  styleUrls: ['./extract-pdf-dialog.component.scss']
})
export class ExtractPdfDialogComponent implements OnInit {

  constructor(
    private dialogRef: MatDialogRef<ExtractPdfDialogComponent>,
  ) { }

  ngOnInit(): void {
  }

  onPdfExtracted(isExtracted: boolean) {
    if (isExtracted) {
      this.dialogRef.close();
    }
  }

  onNoClick() {
    this.dialogRef.close(false);
  }

}
