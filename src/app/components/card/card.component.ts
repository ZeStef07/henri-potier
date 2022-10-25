import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Book } from 'src/app/models/book';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent {

  @Input() book!: Book;
  @Output() clickAddButton = new EventEmitter<Book>();
  @Output() clickRemoveButton = new EventEmitter<Book>();

  disableButton: boolean = false;

  constructor() { }
  
  addButton(book: Book) {
    this.clickAddButton.emit(book);
    this.disableButton = true;
  }

  removeButton(book: Book) {
    this.clickRemoveButton.emit(book);
  }
}
