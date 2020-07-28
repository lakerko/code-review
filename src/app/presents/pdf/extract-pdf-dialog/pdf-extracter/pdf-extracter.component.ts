import { Component, OnInit, Output, EventEmitter } from '@angular/core';

declare var require: any;

const PDFJS = require('pdfjs-dist');

@Component({
  selector: 'app-pdf-extracter',
  templateUrl: './pdf-extracter.component.html',
  styleUrls: ['./pdf-extracter.component.scss']
})
export class PdfExtracterComponent implements OnInit {
  @Output() extractText = new EventEmitter();
  public files: File[] = [];
  public isLoading: boolean = false;

  constructor() {

  }

  ngOnInit() {
    PDFJS.workerSrc = './assets/pdfjs/pdf.worker.entry.js';
    PDFJS.GlobalWorkerOptions.workerSrc = './assets/pdfjs/pdf.worker.entry.js';
    PDFJS.disableWorker = true;
  }

  extractDataFromPdfFiles() {
    this.isLoading = true;
    const promises = [];
    for (const file of this.files) {
      promises.push(this.readFile(file));
    }
    Promise.all(promises).then((results) => {
      const textPagesPromises = [];
      for (const result of results) {
        textPagesPromises.push(this.getPdfFile(result));
      }
      Promise.all(textPagesPromises).then(textPagesResults => {
        this.extractText.emit(textPagesResults);
        this.isLoading = false;
      });
    });
  }

  private async getPdfFile(pdfFile) {
    return new Promise((resolve) => {
      PDFJS.getDocument(pdfFile).then((pdf) => {
        const pageNumber = 1;
        this.getPageText(pageNumber, pdf).then((textPage: any) => {
          return resolve(textPage);
        });
      });
    });
  }

  onSelect(event) {
    // console.log('onSelect', event);
    this.files.push(...event.addedFiles);
  }

  private async readFile(file: File): Promise<string | ArrayBuffer> {
    return new Promise<string | ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = e => {
        return resolve((e.target as FileReader).result);
      };

      reader.onerror = e => {
        console.error(`FileReader failed on file ${file.name}.`);
        return reject(null);
      };

      if (!file) {
        console.error('No file to read.');
        return reject(null);
      }

      reader.readAsDataURL(file);
    });
  }

  onRemove(event) {
    console.log('onRemove', event);
    this.files.splice(this.files.indexOf(event), 1);
  }

  public removeAll() {
    this.files = [];
  }

  /**
   * Retrieves the text of a specif page within a PDF Document obtained through pdf.js
   *
   * @param pageNum Specifies the number of the page
   * @param PDFDocumentInstance The PDF document obtained
   */
  // getPageText(pageNum: number, PDFDocumentInstance: PDFDocument) {
  getPageText(pageNum: number, PDFDocumentInstance) {
    // Return a Promise that is solved once the text of the page is retrieven
    return new Promise((resolve, reject) => {
      PDFDocumentInstance.getPage(pageNum).then((pdfPage) => {
        // The main trick to obtain the text of the PDF page, use the getTextContent method
        pdfPage.getTextContent().then((textContent) => {
          const textItems = textContent.items;
          let finalString = '';

          // Concatenate the string of the item to the final string
          // console.warn('textItems', textItems);
          const trimedStringSegments = textItems.map(item => item.str.trim());
          // console.warn('trimedStringSegments', trimedStringSegments);
          for (const item of textItems) {
            finalString += item.str.trim() + ' ';
          }

          // Solve promise with the text retrieven from the page
          resolve({finalString, trimedStringSegments});
        });
      });
    });
  }

}
