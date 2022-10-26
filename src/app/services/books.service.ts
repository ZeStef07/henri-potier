import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, delay, mergeMap, Observable, of, shareReplay } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Book } from '../models/book';
import { CommercialOffers } from '../models/commercial-offers';

@Injectable({
  providedIn: 'root'
})
export class BooksService {

  constructor(private httpClient: HttpClient) { }

  getBooks(): Observable<Book[]> {
    return this.httpClient.get<Book[]>(`${environment.baseUrlHenriPotier}books`);
  }

  getCommercialOffers(books: Book[]): Observable<CommercialOffers | undefined> {
    if(!books || books.length === 0) {
      return of(undefined);
    }
    // Construction du pathParameters avec la concaténation des ISBN de chaque livre
    const allBooksIsbn = books.map(b => b.isbn).join(',');
    return this.httpClient.get<CommercialOffers>(`${environment.baseUrlHenriPotier}books/${allBooksIsbn}/commercialOffers`).pipe(
      catchError(err => of(undefined))
    );
  }
}
