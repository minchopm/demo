import { Component, HostBinding } from '@angular/core';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'carousel-item',
  templateUrl: 'carousel-item.component.html',
  styleUrls: ['carousel-item.component.scss']
})
export class CarouselItemComponent {
  @HostBinding('class.item') classes = true;
}
