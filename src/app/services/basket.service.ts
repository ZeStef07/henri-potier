import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { Book } from '../models/book';

@Injectable({
  providedIn: 'root'
})
export class BasketService {

  private _books: Book[] | undefined = undefined;
  private _booksNumber$: BehaviorSubject<number> = new BehaviorSubject(0);
  constructor() { }

  /**
   * Permet d'ajouter un livre au panier
   * @param book Le livre a ajouter au panier
   */
  addBook(book: Book): void {
    // Si 'books' n'est pas défini alors on le crée avec le nouvel element directement
    if(!this._books) {
      this._books = [{...book}];
    } else {
      // Si 'books' existe alors on ajoute directement le nouvel élément
      this._books.push({...book});
    }
    this.refreshBooksNumber();
  }

  /**
   * Permet de supprimer un livre du panier
   * @param book Le livre a supprimer du panier
   */
  removeBook(book: Book): void {
    if(!this._books) {
      return;
    }
    // this._books = this._books?. filter(b => b.isbn != book.isbn);
    const idx = this._books.findIndex(b => b.isbn === book.isbn);
    if (idx > -1) {
      this._books.splice(idx, 1);
    }
    this.refreshBooksNumber();
  }

  /**
   * Permet de rafraichir le nombre d'éléments dans le panier
   */
  private refreshBooksNumber(): void {
    console.log(this._books);
    this._booksNumber$.next(this._books ? this._books.length : 0);
  }

  /**
   * Récupère le nombre d'élément actuellement dans le panier
   * @returns Retourne le nombre d'éléments dans le panier
   */
  getBasketItemsNumber(): Observable<number> {
    return this._booksNumber$.asObservable();
  }

  getBasketItems(): Observable<Book[] | undefined> {
    return of(this._books);
  }

}
