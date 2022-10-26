import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { BasketService } from 'src/app/services/basket.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  itemsNumber$!: Observable<number>;
  constructor(private basketService: BasketService) { }

  ngOnInit(): void {
    this.itemsNumber$ = this.basketService.getBasketTotalItems();
  }
}
