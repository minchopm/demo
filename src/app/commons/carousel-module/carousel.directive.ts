import { Directive, TemplateRef, ViewContainerRef } from '@angular/core';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[CarouselItem]'
})
export class CarouselItemDirective {}

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[CarouselNext]'
})
export class CarouselNextDirective {
  // @HostBinding('disabled') disabled: boolean;
  // @HostBinding('style.display') display = 'block';
  // @HostListener('click')
  // onClick() {
  // }
}

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[CarouselPrev]'
})
export class CarouselPrevDirective {
  // @HostBinding('disabled') disabled: boolean;
  // @HostBinding('style.display') display = 'block';
}

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[CarouselPoint]'
})
export class CarouselPointDirective {}

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[CarouselDef]'
})
export class CarouselDefDirective<T> {
  when: (index: number, nodeData: T) => boolean;

  constructor(public template: TemplateRef<any>) {}
}

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[CarouselOutlet]'
})
// tslint:disable-next-line:directive-class-suffix
export class CarouselOutlet {
  constructor(public viewContainer: ViewContainerRef) {}
}
