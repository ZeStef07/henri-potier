import { Component } from '@angular/core';
import { map, tap } from 'rxjs/operators';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { of } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  
  /** Based on the screen size, switch from standard to one column per row */
  cards$ = of([
        { title: 'Card 1', cols: 1, rows: 1 },
        { title: 'Card 2', cols: 1, rows: 1 },
        { title: 'Card 3', cols: 1, rows: 2 },
        { title: 'Card 4', cols: 1, rows: 1 }
      ]);

  columnsNumber$ = this.breakpointObserver.observe([Breakpoints.Large, Breakpoints.Medium, Breakpoints.Small]).pipe(
    map(breakpointState => {
      if(this.breakpointObserver.isMatched(Breakpoints.Medium)) {
        return 2;
      }
      if(this.breakpointObserver.isMatched(Breakpoints.Small)) {
        return 1;
      }
      return 4;
    })
  );

  constructor(private breakpointObserver: BreakpointObserver) { }
}
