import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, Subject, takeUntil } from 'rxjs';
import { BasketState } from 'src/app/models/basket-state';
import { Book } from 'src/app/models/book';
import { Proposition } from 'src/app/models/proposition';
import { BasketService } from 'src/app/services/basket.service';

@Component({
  selector: 'app-basket',
  templateUrl: './basket.component.html',
  styleUrls: ['./basket.component.scss']
})
export class BasketComponent implements OnInit, OnDestroy {

  displayedColumns: string[] = ['item', 'price', 'quantity', 'actions'];
  dataSource = new MatTableDataSource<Book>;
  totalProposition$!: Observable<Proposition>;
  totalQuantity$!: Observable<number>;
  // Permet de gérer la désinscription
  destroyed$: Subject<void> = new Subject();

  constructor(
    private basketService: BasketService
  ) { }

  ngOnInit(): void {
    this.basketService.getBasketItems().pipe(
      takeUntil(this.destroyed$)
    ).subscribe((basketState: BasketState) => {
      this.dataSource.data = basketState.books;
    });

    this.totalProposition$ = this.basketService.getBasketTotalPrice();
    this.totalQuantity$ = this.basketService.getBasketTotalItems();
  }

  /**
   * Permet d'ajouter un livre au panier
   * @param book Le livre à ajouter au panier
   */
  addButton(book: Book): void {
    this.basketService.addBook(book);
  }
  
  /**
   * Permet de supprimer un livre du panier
   * @param book Le livre a supprimer du panier
   */
  removeButton(book: Book): void {
    this.basketService.removeBook(book);
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
  }
}
