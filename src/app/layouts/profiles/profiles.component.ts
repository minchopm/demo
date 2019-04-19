import { ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { MatTable, Sort } from '@angular/material';
import { ProfileService } from '../../shared/profile.service';

export interface User {
  username: string;
  password: string;
  email: string;
  subscribe: boolean;
}

@Component({
  selector: 'app-list',
  templateUrl: './profiles.component.html',
  styleUrls: ['./profiles.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class ProfilesComponent implements OnInit {
  @ViewChild('table') table: MatTable<User>;
  displayedColumns: string[] = ['username', 'password', 'email', 'subscribe'];
  dataSource: User[];

  constructor(private proficeService: ProfileService) {
    this.dataSource = proficeService.getProfiles();
  }

  compare(a: number | string | boolean, b: number | string | boolean, isAsc: boolean) {
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
        case 'username':
          return this.compare(a.username, b.username, isAsc);
        case 'email':
          return this.compare(a.email, b.email, isAsc);
        case 'password':
          return this.compare(a.password, b.password, isAsc);
        case 'subscribe':
          return this.compare(a.subscribe, b.subscribe, isAsc);
        default:
          return 0;
      }
    });
  }

  removeProfile(element) {
    this.dataSource = this.dataSource.filter(item => item !== element);
    this.proficeService.addProfiles(this.dataSource);
  }

  move(source, from, to) {
    source.splice(to, 0, source.splice(from, 1)[0]);
    return source;
  }

  drop(event: CdkDragDrop<string[]>) {
    this.sortData({active: 'name', direction: 'asc'});
    const data = [...this.proficeService.profiles];
    this.dataSource.splice(0, this.dataSource.length);
    this.dataSource.push.apply(this.dataSource, this.move(data, event.previousIndex, event.currentIndex));
  }

  ngOnInit() {
  }
}
