import { Component, OnInit } from '@angular/core';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { BooksService } from 'src/app/services/books.service';
import { Book } from 'src/app/models/book';
import { BasketService } from 'src/app/services/basket.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  books$!: Observable<Book[]>;
  columnsNumber$!: Observable<number>;
  public searchBooksTerm = new BehaviorSubject<string>('');

  constructor(
    private breakpointObserver: BreakpointObserver,
    private booksService: BooksService,
    private basketService: BasketService) { }

  ngOnInit(): void {
    // Gestion du filtre sur la liste des livres
    const bookFilterTerm$ = this.searchBooksTerm.pipe(
      debounceTime(300),
      distinctUntilChanged()
    );

    // Récupération de la liste des livres disponibles en fonction du filtre appliqué
    this.books$ = combineLatest([bookFilterTerm$, this.booksService.getBooks()]).pipe(
      map(([term, books]: [string, Book[]]) => this.filterBooks(books, term))
    );

    // Gestion du responsive design
    this.columnsNumber$ = this.breakpointObserver.observe([Breakpoints.XLarge, Breakpoints.Large, Breakpoints.Medium, Breakpoints.Small, Breakpoints.XSmall]).pipe(
      map(_ => {
        if(this.breakpointObserver.isMatched([Breakpoints.XSmall, Breakpoints.Small])) {
          return 1;
        }
        if(this.breakpointObserver.isMatched(Breakpoints.Medium)) {
          return 2;
        }
        if(this.breakpointObserver.isMatched(Breakpoints.Large)) {
          return 4;
        }
        return 5;
      })
    );
  }

  /**
   * Permet d'ajouter un livre au panier
   * @param book Représente le livre à ajouter au panier
   */
  addBook(book: Book) { 
    this.basketService.addBook(book);
  }

  /**
   * Permet de supprimer un livre du panier
   * @param book Représente le livre à supprimer du panier
   */
  removeBook(book: Book) {
    this.basketService.removeBook(book);
  }

  /**
   * Récupère la quantité du livre spécifié présent dans le panier
   * @param book Le livre pour lequel on doit récupérer la quantité dans le panier
   * @returns Retourne la quantité du livre spécifié présent dans le panier
   */
  getBookQuantity(book: Book): Observable<number> {
    return this.basketService.getBasketQuantityBook(book);
  }

  /**
   * Permet de gérer le filtrage des livres
   * @param term Le texte de recherche
   */
  search(term: string) {
    this.searchBooksTerm.next(term);
  }

  /**
   * Filtre les livres en fonction de la recherche saisie
   * @param books La liste à filtrer
   * @param term Le texte saisi à rechercher
   * @returns Retourne la liste des livres satisfaisant la recherche
   */
  filterBooks(books: Book[], term: string): Book[] {
    return books.filter(b => {
      return b.isbn.match(new RegExp(term, 'gi')) || b.title.match(new RegExp(term, 'gi'))
    });
  }
}
