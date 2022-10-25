import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Book } from 'src/app/models/book';
import { BasketService } from 'src/app/services/basket.service';

@Component({
  selector: 'app-basket',
  templateUrl: './basket.component.html',
  styleUrls: ['./basket.component.sass']
})
export class BasketComponent implements OnInit {

  books$!: Observable<Book[] | undefined>;

  constructor(private basketService: BasketService) { }

  ngOnInit(): void {
    this.books$ = this.basketService.getBasketItems();
  }

}
