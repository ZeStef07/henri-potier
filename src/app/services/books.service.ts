import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Book } from '../models/book';

@Injectable({
  providedIn: 'root'
})
export class BooksService {

  constructor(private httpClient: HttpClient) { }

  getBooks(): Observable<Book[]> {
    return this.httpClient.get<Book[]>(`${environment.baseUrlHenriPotier}books`);
  }

  applyBestCommercialOffer(books: Book[]): Observable<Book[]> {
    // Construction du pathParameters avec la concaténation des ISBN de chaque livre
    const allBooksIsbn = books.map(b => b.isbn).join(',');
    return this.httpClient.get<Book[]>(`${environment.baseUrlHenriPotier}books/${allBooksIsbn}`);
  }
}
