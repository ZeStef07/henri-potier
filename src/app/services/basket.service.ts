import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, concatMap, forkJoin, map, mergeMap, Observable, of, switchMap, toArray } from 'rxjs';
import { BasketState } from '../models/basket-state';
import { Book } from '../models/book';
import { CommercialOffers } from '../models/commercial-offers';
import { Offer } from '../models/offer';
import { OFFER_TYPE } from '../models/utils';
import { BooksService } from './books.service';

@Injectable({
  providedIn: 'root'
})
export class BasketService {

  private _booksSubject$ = new BehaviorSubject<BasketState>({books: []});
  private _books: Book[] = [];
  private _booksNumber$ = new BehaviorSubject<number>(0);

  constructor(private booksService: BooksService) { }

  /**
   * Permet d'ajouter un livre au panier
   * @param book Le livre a ajouter au panier
   */
  addBook(book: Book): void {
    // On regarde si le livre existe deja dans le panier
    let index = this._books.findIndex(b => b.isbn === book.isbn);
    if(index >= 0) {
      this._books[index].basketQuantity++;
    } else {
      this._books.push({ 
        ...book,
        basketQuantity: 1
      });
    }
    this._booksSubject$.next({books: this._books});
    this.refreshBooksNumber();
  }

  /**
   * Permet de supprimer un livre du panier
   * @param book Le livre a supprimer du panier
   */
  removeBook(book: Book): void {
    const idx = this._books.findIndex(b => b.isbn === book.isbn);
    if (idx >=0) {
      // Si le livre existe et que sa quantité est à 1, on supprime le livre du panier
      if(this._books[idx].basketQuantity === 1) {
        this._books.splice(idx, 1);
      } else {
        // Si sa quantité ne vaut pas 1 alors on réduit sa quantité dans le panier
        let quantity = this._books[idx].basketQuantity as number;
        this._books[idx].basketQuantity = quantity - 1;
      }
    }
    this._booksSubject$.next({books: this._books});
    this.refreshBooksNumber();
  }

  /**
   * Permet de rafraichir le nombre d'éléments dans le panier
   */
  private refreshBooksNumber(): void {
    const result = this._books.reduce((accumulator, book) => {
      return accumulator + book.basketQuantity;
    }, 0);

    this._booksNumber$.next(result);
  }

  /**
   * Récupère le nombre de livres actuellement dans le panier
   * @returns Retourne le nombre d'éléments dans le panier
   */
  getBasketTotalItems(): Observable<number> {
    return this._booksNumber$.asObservable();
  }

  /**
   * Récupère le nombre de livres actuellement dans le panier
   * @returns Retourne le nombre d'éléments dans le panier
   */
   getBasketQuantityBook(book: Book): Observable<number> {
    return this._booksSubject$.asObservable().pipe(
      map(basketState => basketState.books.filter(b => b.isbn === book.isbn).reduce((accumulator, book) => {
          return accumulator + book.basketQuantity
        }, 0)
      )
    );
  }

  /**
   * Récupère le contenu du panier
   * @returns Retourne le contenu du panier
   */
   getBasketItems(): Observable<BasketState> {
    return this._booksSubject$.asObservable();
  }

  /**
   * Récupère le total à payer
   * @returns Retourne le montant à payer
   */
  getBasketTotalPrice(): Observable<number> {
    return this._booksSubject$.asObservable().pipe(
      mergeMap(_ => this.booksService.getCommercialOffers(this._books)),
      map((commercialOffers: CommercialOffers | undefined) => this.computeTotalPrice(this._books, commercialOffers))
    );
  }

  /**
   * Calcul en fonction du total, la meilleure remise parmi celles proposées par le système
   * @param books La liste des livres du panier
   * @param commercialOffers La liste des offres commerciales (réductions)
   * @returns Retourne le total avec la meilleure remise appliquée
   */
  private computeTotalPrice(books: Book[], commercialOffers: CommercialOffers | undefined): number {
    const total = books.reduce((accumulator, book) => accumulator + book.price * book.basketQuantity, 0)
    if(!commercialOffers) { 
      return total;
    }
    // On calcule tous les montants en fonction des offres et on prend la meilleure (montant le plus bas)
    const allPropositions: number[] = commercialOffers.offers.map((offer: Offer) => this.computeTotalWithOffer(total, offer)).sort((a, b) => a - b);
    return allPropositions[0];
  }

  /**
   * Calcul le total en fonction de l'offre à appliquer
   * @param total Total brut du prix des livres du panier
   * @param offer Offre commerciale à appliquer
   * @returns Retourne le total emputé de l'offre à appliquer
   */
  private computeTotalWithOffer(total: number, offer: Offer): number {
    if(!offer) {
      return total;
    }
    // Pour chaque type d'offre on calcule le total
    switch(offer.type) {
      case OFFER_TYPE.PERCENTAGE:
        return this.computePercentage(total, offer.value);
      case OFFER_TYPE.MINUS:
        return this.computeMinus(total, offer.value);
      case OFFER_TYPE.SLICE:
        return this.computeSlice(total, offer.value, offer.sliceValue);
      default:
        return total;
    }
  }

  /**
   * Calcul le total en fonction du pourcentage à appliquer
   * @param total Total brut du prix des livres du panier
   * @param value Pourcentage de la remise
   * @returns Retourne le total emputé du pourcentage à appliquer
   */
  private computePercentage(total: number, value: number) : number {
    return total * ((100 - value) / 100);
  }

  /**
   * Calcul le total en fonction du montant de la remise à appliquer
   * @param total Total brut du prix des livres du panier
   * @param value Montant de la remise
   * @returns Retourne le total emputé du montant de la remise à appliquer
   */
  private computeMinus(total: number, value: number) : number {
    return total - value;
  }

  /**
   * Calcul le total en fonction de la remise par tranches à appliquer
   * @param total Total brut du prix des livres du panier
   * @param value Réduction à soustraire par tranches de 'sliceValue'
   * @param sliceValue Indique les tranches selon lesquelles appliquer la remise
   * @returns Retourne le total emputé du montant de la remise calculé
   */
  private computeSlice(total: number, value: number, sliceValue: number) : number {
    const modulo = total / sliceValue;
    if(modulo >= 1) {
      return total - (Math.round(modulo) * value);
    } else {
      return total;
    }
  }
}
