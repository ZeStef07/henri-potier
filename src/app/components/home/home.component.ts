import { Component, OnInit } from '@angular/core';
import { map, tap } from 'rxjs/operators';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { Observable, of } from 'rxjs';
import { BooksService } from 'src/app/services/books.service';
import { Book } from 'src/app/models/book';
import { BasketService } from 'src/app/services/basket.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  books$: Observable<Book[]> | undefined;
  columnsNumber$!: Observable<number>;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private booksService: BooksService,
    private basketService: BasketService) { }

  ngOnInit(): void {
    // Récupération de la liste des livres disponibles
    this.books$ = this.booksService.getBooks();
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
          return 3;
        }
        return 4;
      })
    );
  }

  /**
   * Permet d'ajouter un livre au panier
   * @param book Représente le livre à ajouter au panier
   */
  addBook(book: Book) {
    console.log('addBook');
    this.basketService.addBook(book);
  }

  /**
   * Permet de supprimer un livre du panier
   * @param book Représente le livre à supprimer du panier
   */
   removeBook(book: Book) {
    console.log('removeBook');
    this.basketService.removeBook(book);
  }
}
