import {
  CarouselPointDirective,
  CarouselItemDirective,
  CarouselNextDirective,
  CarouselPrevDirective,
  CarouselDefDirective,
  CarouselOutlet
} from './carousel.directive';
import { CarouselItemComponent } from './carousel-item/carousel-item.component';
import {
  HammerGestureConfig,
  HAMMER_GESTURE_CONFIG
} from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Carousel } from './carousel/carousel.component';
import { CarouselTileComponent } from './carousel-tile/carousel-tile.component';

@NgModule({
  imports: [CommonModule],
  exports: [
    Carousel,
    CarouselItemComponent,
    CarouselTileComponent,
    CarouselPointDirective,
    CarouselItemDirective,
    CarouselNextDirective,
    CarouselPrevDirective,
    CarouselDefDirective,
    CarouselOutlet
  ],
  declarations: [
    Carousel,
    CarouselItemComponent,
    CarouselTileComponent,
    CarouselPointDirective,
    CarouselItemDirective,
    CarouselNextDirective,
    CarouselPrevDirective,
    CarouselDefDirective,
    CarouselOutlet
  ]
})
export class CarouselModule {}
