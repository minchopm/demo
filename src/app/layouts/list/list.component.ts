import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { MatTable, Sort } from '@angular/material';

export interface PeriodicElement {
  name: string;
  pos: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {pos: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
  {pos: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
  {pos: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
  {pos: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
  {pos: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
  {pos: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
  {pos: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
  {pos: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'},
  {pos: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'},
  {pos: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'},
  {pos: 11, name: 'Sodium', weight: 22.9897, symbol: 'Na'},
  {pos: 12, name: 'Magnesium', weight: 24.305, symbol: 'Mg'},
  {pos: 13, name: 'Aluminum', weight: 26.9815, symbol: 'Al'},
  {pos: 14, name: 'Silicon', weight: 28.0855, symbol: 'Si'},
  {pos: 15, name: 'Phosphorus', weight: 30.9738, symbol: 'P'},
  {pos: 16, name: 'Sulfur', weight: 32.065, symbol: 'S'},
  {pos: 17, name: 'Chlorine', weight: 35.453, symbol: 'Cl'},
  {pos: 18, name: 'Argon', weight: 39.948, symbol: 'Ar'},
  {pos: 19, name: 'Potassium', weight: 39.0983, symbol: 'K'},
  {pos: 20, name: 'Calcium', weight: 40.078, symbol: 'Ca'}
];

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class ListComponent implements OnInit {
  @ViewChild('table') table: MatTable<PeriodicElement>;
  displayedColumns: string[] = ['pos', 'name', 'weight', 'symbol'];
  dataSource: PeriodicElement[] = ELEMENT_DATA;

  constructor(private ref: ChangeDetectorRef) {
  }

  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  sortData(sort: Sort) {
    const data = this.dataSource.slice();
    if (!sort.active || sort.direction === '') {
      this.dataSource = data;
      return;
    }

    this.dataSource = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'pos':
          return this.compare(a.pos, b.pos, isAsc);
        case 'name':
          return this.compare(a.name, b.name, isAsc);
        case 'weight':
          return this.compare(a.weight, b.weight, isAsc);
        case 'symbol':
          return this.compare(a.symbol, b.symbol, isAsc);
        default:
          return 0;
      }
    });
  }

  move(source, from, to) {
    source.splice(to, 0, source.splice(from, 1)[0]);
    return source;
  }

  drop(event: CdkDragDrop<string[]>) {
    this.sortData({active: 'name', direction: 'asc'});
    const data = [...ELEMENT_DATA];
    this.dataSource.splice(0, this.dataSource.length);
    this.dataSource.push.apply(this.dataSource, this.move(data, event.previousIndex, event.currentIndex));
  }

  ngOnInit() {
  }
}
