import { isPlatformBrowser } from '@angular/common';
import {
  AfterContentInit,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ContentChildren,
  DoCheck,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  isDevMode,
  IterableChangeRecord,
  IterableChanges,
  IterableDiffer,
  IterableDiffers,
  OnDestroy,
  OnInit,
  Output,
  PLATFORM_ID,
  QueryList,
  Renderer2,
  TrackByFunction,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import * as Hammer from 'hammerjs';
import {
  empty,
  fromEvent,
  interval,
  merge,
  Observable,
  of,
  Subject,
  Subscription
} from 'rxjs';
import { mapTo, startWith, switchMap, takeUntil } from 'rxjs/operators';
import {
  CarouselDefDirective,
  CarouselNextDirective,
  CarouselOutlet,
  CarouselPrevDirective
} from '../carousel.directive';
import {
  CarouselConfig,
  CarouselOutletContext,
  CarouselStore
} from './carousel';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'app-carousel',
  templateUrl: 'carousel.component.html',
  styleUrls: ['carousel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
// tslint:disable-next-line:component-class-suffix
export class Carousel<T> extends CarouselStore
  implements OnInit, AfterContentInit, AfterViewInit, OnDestroy, DoCheck {
  dataSubscription: Subscription;
  carouselDataSource: any;
  carouselDataDiffer: IterableDiffer<{}>;
  styleid: string;
  private directionSym: string;
  private carouselCssNode: any;
  private pointIndex: number;
  private withAnim = true;
  activePoint: number;
  isHovered = false;

  @Input('inputs')
  private inputs: CarouselConfig;
  @Output('carouselLoad')
  private carouselLoad = new EventEmitter();

  // tslint:disable-next-line:no-output-on-prefix
  @Output('onMove')
  private onMove = new EventEmitter<Carousel<T>>();
  // isFirstss = 0;
  arrayChanges: IterableChanges<{}>;
  carouselInt: Subscription;

  listener1: () => void;
  listener2: () => void;
  listener3: () => void;
  listener4: () => void;

  @Input('dataSource')
  get dataSource(): any {
    return this.carouselDataSource;
  }
  set dataSource(data: any) {
    if (data) {
      // console.log(data, this.dataSource);
      // this.isFirstss++;
      this._switchDataSource(data);
    }
  }

  private carouselDefaultNodeDef: CarouselDefDirective<any> | null;

  @ContentChildren(CarouselDefDirective)
  private carouselDefDirec: QueryList<CarouselDefDirective<any>>;

  @ViewChild(CarouselOutlet) carouselNodeOutlet: CarouselOutlet;

  /** The setter is used to catch the button if the button has ngIf
   * issue id #91
   */
  @ContentChild(CarouselNextDirective, { read: ElementRef })
  set nextBtn(btn: ElementRef) {
    this.listener2 && this.listener2();
    if (btn) {
      this.listener2 = this.renderer.listen(btn.nativeElement, 'click', () =>
        this._carouselScrollOne(1)
      );
    }
  }

  /** The setter is used to catch the button if the button has ngIf
   * issue id #91
   */
  @ContentChild(CarouselPrevDirective, { read: ElementRef })
  set prevBtn(btn: ElementRef) {
    this.listener1 && this.listener1();
    if (btn) {
      this.listener1 = this.renderer.listen(btn.nativeElement, 'click', () =>
        this._carouselScrollOne(0)
      );
    }
  }

  @ViewChild('carousel', { read: ElementRef })
  private carouselMainEl: ElementRef;

  @ViewChild('carouselItemsContainer', { read: ElementRef })
  private carouselItemsContainer: ElementRef;

  @ViewChild('touchContainer', { read: ElementRef })
  private touchContainer: ElementRef;

  private carouselIntervalController$ = new Subject<number>();

  private carousel: any;

  private onResize: any;
  private onScrolling: any;

  pointNumbers: Array<any> = [];

  /**
   * Tracking function that will be used to check the differences in data changes. Used similarly
   * to `ngFor` `trackBy` function. Optimize Items operations by identifying a Items based on its data
   * relative to the function to know if a Items should be added/removed/moved.
   * Accepts a function that takes two parameters, `index` and `item`.
   */
  @Input()
  get trackBy(): TrackByFunction<T> {
    return this.carouselTrackByFn;
  }
  set trackBy(fn: TrackByFunction<T>) {
    if (
      isDevMode() &&
      fn != null &&
      typeof fn !== 'function' && (console as any) && (console as any).warn
    ) {
      console.warn(
        `trackBy must be a function, but received ${JSON.stringify(fn)}.`
      );
    }
    this.carouselTrackByFn = fn;
  }
  private carouselTrackByFn: TrackByFunction<T>;

  constructor(
    private carouselEl: ElementRef,
    private renderer: Renderer2,
    private differs: IterableDiffers,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) {
    super();
    console.log(this.carouselMainEl);
  }

  ngOnInit() {
    this.carouselDataDiffer = this.differs
      .find([])
      .create((i: number, item: any) => {
        return this.trackBy ? this['trackBy'](item.dataIndex, item.data) : item;
      });
  }

  ngDoCheck() {
    this.arrayChanges = this.carouselDataDiffer.diff(this.dataSource);
    if (this.arrayChanges && this.carouselDefDirec) {
      // console.log('Changes detected!');
      this._observeRenderChanges();
    }
  }

  private _switchDataSource(dataSource: any): any {
    this.carouselDataSource = dataSource;
    if (this.carouselDefDirec) {
      this._observeRenderChanges();
    }
  }

  private _observeRenderChanges() {
    let dataStream: Observable<any[]> | undefined;

    if (this.carouselDataSource instanceof Observable) {
      dataStream = this.carouselDataSource;
    } else if (Array.isArray(this.carouselDataSource)) {
      dataStream = of(this.carouselDataSource);
    }

    if (dataStream) {
      this.dataSubscription = dataStream
        .pipe(takeUntil(this.carouselIntervalController$))
        .subscribe(data => {
          this.renderNodeChanges(data);
          this.isLast = false;
        });
    }
  }

  private renderNodeChanges(
    data: any[],
    viewContainer: ViewContainerRef = this.carouselNodeOutlet.viewContainer
  ) {
    if (!this.arrayChanges) {
      return;
    }

    this.arrayChanges.forEachOperation(
      (
        item: IterableChangeRecord<any>,
        adjustedPreviousIndex: number,
        currentIndex: number
      ) => {
        // const node = this.carouselDefDirec.find(items => item.item);
        const node = this._getNodeDef(data[currentIndex], currentIndex);

        if (item.previousIndex == null) {
          const context = new CarouselOutletContext<any>(data[currentIndex]);
          context.index = currentIndex;
          viewContainer.createEmbeddedView(
            node.template,
            context,
            currentIndex
          );
        } else if (currentIndex == null) {
          viewContainer.remove(adjustedPreviousIndex);
        } else {
          const view = viewContainer.get(adjustedPreviousIndex);
          viewContainer.move(view, currentIndex);
        }
      }
    );
    this._updateItemIndexContext();

    if (this.carousel) {
      this._storeCarouselData();
    }
    // console.log(this.dataSource);
  }

  /**
   * Updates the index-related context for each row to reflect any changes in the index of the rows,
   * e.g. first/last/even/odd.
   */
  private _updateItemIndexContext() {
    const viewContainer = this.carouselNodeOutlet.viewContainer;
    for (
      let renderIndex = 0, count = viewContainer.length;
      renderIndex < count;
      renderIndex++
    ) {
      const viewRef = viewContainer.get(renderIndex) as any;
      const context = viewRef.context as any;
      context.count = count;
      context.first = renderIndex === 0;
      context.last = renderIndex === count - 1;
      context.even = renderIndex % 2 === 0;
      context.odd = !context.even;
      context.index = renderIndex;
    }
  }

  private _getNodeDef(data: any, i: number): CarouselDefDirective<any> {
    // console.log(this.carouselDefDirec);
    if (this.carouselDefDirec.length === 1) {
      return this.carouselDefDirec.first;
    }

    const nodeDef =
      this.carouselDefDirec.find(def => def.when && def.when(i, data)) ||
      this.carouselDefaultNodeDef;

    return nodeDef;
  }

  ngAfterViewInit() {
    this.carousel = this.carouselEl.nativeElement;
    this._inputValidation();

    this.carouselCssNode = this._createStyleElem();

    // this._buttonControl();

    if (isPlatformBrowser(this.platformId)) {
      this._carouselInterval();
      if (!this.vertical.enabled) {
        this._touch();
      }
      this.listener3 = this.renderer.listen('window', 'resize', event => {
        this._onResizing(event);
      });
      this._onWindowScrolling();
    }
  }

  ngAfterContentInit() {
    this._observeRenderChanges();

    this.cdr.markForCheck();
  }

  private _inputValidation() {
    this.type = this.inputs.grid.all !== 0 ? 'fixed' : 'responsive';
    this.loop = this.inputs.loop || false;
    this.inputs.easing = this.inputs.easing || 'cubic-bezier(0, 0, 0.2, 1)';
    this.touch.active = this.inputs.touch || false;
    this.RTL = this.inputs.RTL ? true : false;
    this.interval = this.inputs.interval || null;
    this.velocity =
      typeof this.inputs.velocity === 'number'
        ? this.inputs.velocity
        : this.velocity;

    if (this.inputs.vertical && this.inputs.vertical.enabled) {
      this.vertical.enabled = this.inputs.vertical.enabled;
      this.vertical.height = this.inputs.vertical.height;
    }
    this.directionSym = this.RTL ? '' : '-';
    this.point =
      this.inputs.point && typeof this.inputs.point.visible !== 'undefined'
        ? this.inputs.point.visible
        : true;

    this._carouselSize();
  }

  ngOnDestroy() {
    // clearInterval(this.carouselInt);
    this.carouselInt && this.carouselInt.unsubscribe();
    this.carouselIntervalController$.unsubscribe();
    this.carouselLoad.complete();
    this.onMove.complete();

    /** remove listeners */
    for (let i = 1; i <= 4; i++) {
      const str = `listener${i}`;
      this[str] && this[str]();
    }
  }

  private _onResizing(event: any): void {
    clearTimeout(this.onResize);
    this.onResize = setTimeout(() => {
      if (this.deviceWidth !== event.target.outerWidth) {
        this._setStyle(this.carouselItemsContainer.nativeElement, 'transition', ``);
        this._storeCarouselData();
      }
    }, 500);
  }

  /** Get Touch input */
  private _touch(): void {
    if (this.inputs.touch) {
      const hammertime = new Hammer(this.touchContainer.nativeElement);
      hammertime.get('pan').set({ direction: Hammer['DIRECTION_HORIZONTAL'] });

      hammertime.on('panstart', (ev: any) => {
        this.carouselWidth = this.carouselItemsContainer.nativeElement.offsetWidth;
        this.touchTransform = this.transform[this.deviceType];
        this.dexVal = 0;
        this._setStyle(this.carouselItemsContainer.nativeElement, 'transition', '');
      });
      if (this.vertical.enabled) {
        hammertime.on('panup', (ev: any) => {
          this._touchHandling('panleft', ev);
        });
        hammertime.on('pandown', (ev: any) => {
          this._touchHandling('panright', ev);
        });
      } else {
        hammertime.on('panleft', (ev: any) => {
          this._touchHandling('panleft', ev);
        });
        hammertime.on('panright', (ev: any) => {
          this._touchHandling('panright', ev);
        });
      }
      hammertime.on('panend', (ev: any) => {
        if (Math.abs(ev.velocity) >= this.velocity) {
          this.touch.velocity = ev.velocity;
          let direc = 0;
          if (!this.RTL) {
            direc = this.touch.swipe === 'panright' ? 0 : 1;
          } else {
            direc = this.touch.swipe === 'panright' ? 1 : 0;
          }
          this._carouselScrollOne(direc);
        } else {
          this.dexVal = 0;
          this._setStyle(
            this.carouselItemsContainer.nativeElement,
            'transition',
            'transform 324ms cubic-bezier(0, 0, 0.2, 1)'
          );
          this._setStyle(this.carouselItemsContainer.nativeElement, 'transform', '');
        }
      });
      hammertime.on('hammer.input', function(ev) {
        ev.srcEvent.stopPropagation();
      });
    }
  }

  /** handle touch input */
  private _touchHandling(e: string, ev: any): void {
    // vertical touch events seem to cause to panstart event with an odd delta
    // and a center of {x:0,y:0} so this will ignore them
    if (ev.center.x === 0) {
      return;
    }

    ev = Math.abs(this.vertical.enabled ? ev.deltaY : ev.deltaX);
    let valt = ev - this.dexVal;
    valt =
      this.type === 'responsive'
        ? (Math.abs(ev - this.dexVal) /
            (this.vertical.enabled
              ? this.vertical.height
              : this.carouselWidth)) *
          100
        : valt;
    this.dexVal = ev;
    this.touch.swipe = e;
    this._setTouchTransfrom(e, valt);
    this._setTransformFromTouch();
  }

  private _setTouchTransfrom(e: string, valt: number) {
    const condition = this.RTL ? 'panright' : 'panleft';
    this.touchTransform =
      e === condition ? valt + this.touchTransform : this.touchTransform - valt;
  }

  private _setTransformFromTouch() {
    if (this.touchTransform < 0) {
      this.touchTransform = 0;
    }
    const type = this.type === 'responsive' ? '%' : 'px';
    this._setStyle(
      this.carouselItemsContainer.nativeElement,
      'transform',
      this.vertical.enabled
        ? `translate3d(0, ${this.directionSym}${this.touchTransform}${type}, 0)`
        : `translate3d(${this.directionSym}${this.touchTransform}${type}, 0, 0)`
    );
  }

  /** this fn used to disable the interval when it is not on the viewport */
  private _onWindowScrolling(): void {
    const top = this.carousel.offsetTop;
    const scrollY = window.scrollY;
    const heightt = window.innerHeight;
    const carouselHeight = this.carousel.offsetHeight;
    const isCarouselOnScreen =
      top <= scrollY + heightt - carouselHeight / 4 &&
      top + carouselHeight / 2 >= scrollY;

    if (isCarouselOnScreen) {
      this.carouselIntervalController$.next(1);
    } else {
      this.carouselIntervalController$.next(0);
    }
  }

  /** store data based on width of the screen for the carousel */
  private _storeCarouselData(): void {
    this.deviceWidth = isPlatformBrowser(this.platformId)
      ? window.innerWidth
      : 1200;

    this.carouselWidth = this.carouselMainEl.nativeElement.offsetWidth;

    if (this.type === 'responsive') {
      this.deviceType =
        this.deviceWidth >= 1200
          ? 'lg'
          : this.deviceWidth >= 992
            ? 'md'
            : this.deviceWidth >= 768
              ? 'sm'
              : 'xs';

      this.items = this.inputs.grid[this.deviceType];
      this.itemWidth = this.carouselWidth / this.items;
    } else {
      this.items = Math.trunc(this.carouselWidth / this.inputs.grid.all);
      this.itemWidth = this.inputs.grid.all;
      this.deviceType = 'all';
    }

    this.slideItems = +(this.inputs.slide < this.items
      ? this.inputs.slide
      : this.items);
    this.load =
      this.inputs.load >= this.slideItems ? this.inputs.load : this.slideItems;
    this.speed =
      this.inputs.speed && this.inputs.speed > -1 ? this.inputs.speed : 400;
    this._carouselPoint();
  }

  /** Used to reset the carousel */
  public reset(withOutAnimation?: boolean): void {
    withOutAnimation && (this.withAnim = false);
    this.carouselCssNode.innerHTML = '';
    this.moveTo(0);
    this._carouselPoint();
  }

  /** Init carousel point */
  private _carouselPoint(): void {
    // debugger;
    // if (this.userData.point.visible === true) {
    const Nos = this.dataSource.length - (this.items - this.slideItems);
    this.pointIndex = Math.ceil(Nos / this.slideItems);
    const pointers = [];

    if (this.pointIndex > 1 || !this.inputs.point.hideOnSingleSlide) {
      for (let i = 0; i < this.pointIndex; i++) {
        pointers.push(i);
      }
    }
    this.pointNumbers = pointers;
    // console.log(this.pointNumbers);
    this._carouselPointActiver();
    if (this.pointIndex <= 1) {
      this._btnBoolean(1, 1);
    } else {
      if (this.currentSlide === 0 && !this.loop) {
        this._btnBoolean(1, 0);
      } else {
        this._btnBoolean(0, 0);
      }
    }
    // }
  }

  /** change the active point in carousel */
  private _carouselPointActiver(): void {
    const i = Math.ceil(this.currentSlide / this.slideItems);
    this.activePoint = i;
    // console.log(this.data);
    this.cdr.markForCheck();
  }

  /** this function is used to scoll the carousel when point is clicked */
  public moveTo(slide: number, withOutAnimation?: boolean) {
    // slide = slide - 1;
    withOutAnimation && (this.withAnim = false);
    if (this.activePoint !== slide && slide < this.pointIndex) {
      let slideremains;
      const btns = this.currentSlide < slide ? 1 : 0;

      switch (slide) {
        case 0:
          this._btnBoolean(1, 0);
          slideremains = slide * this.slideItems;
          break;
        case this.pointIndex - 1:
          this._btnBoolean(0, 1);
          slideremains = this.dataSource.length - this.items;
          break;
        default:
          this._btnBoolean(0, 0);
          slideremains = slide * this.slideItems;
      }
      this._carouselScrollTwo(btns, slideremains, this.speed);
    }
  }

  /** set the style of the carousel based the inputs data */
  private _carouselSize(): void {
    this.token = this._generateID();
    let dism = '';
    this.styleid = `.${
      this.token
    } > .carousel > .carousel-touch-container > .carousel-items`;

    if (this.inputs.custom === 'banner') {
      this.renderer.addClass(this.carousel, 'banner');
    }

    if (this.inputs.animation === 'lazy') {
      dism += `${this.styleid} > .item {transition: transform .6s ease;}`;
    }

    let itemStyle = '';
    if (this.vertical.enabled) {
      const itemWidthXs = `${this.styleid} > .item {height: ${this.vertical
        .height / +this.inputs.grid.xs}px}`;
      const itemWidthSm = `${this.styleid} > .item {height: ${this.vertical
        .height / +this.inputs.grid.sm}px}`;
      const itemWidthMd = `${this.styleid} > .item {height: ${this.vertical
        .height / +this.inputs.grid.md}px}`;
      const itemWidthLg = `${this.styleid} > .item {height: ${this.vertical
        .height / +this.inputs.grid.lg}px}`;

      itemStyle = `@media (max-width:767px){${itemWidthXs}}
                    @media (min-width:768px){${itemWidthSm}}
                    @media (min-width:992px){${itemWidthMd}}
                    @media (min-width:1200px){${itemWidthLg}}`;
    } else if (this.type === 'responsive') {
      const itemWidthXs =
        this.inputs.type === 'mobile'
          ? `${this.styleid} .item {flex: 0 0 ${95 /
              +this.inputs.grid.xs}%; width: ${95 / +this.inputs.grid.xs}%;}`
          : `${this.styleid} .item {flex: 0 0 ${100 /
              +this.inputs.grid.xs}%; width: ${100 / +this.inputs.grid.xs}%;}`;

      const itemWidthSm = `${this.styleid} > .item {flex: 0 0 ${100 /
        +this.inputs.grid.sm}%; width: ${100 / +this.inputs.grid.sm}%}`;
      const itemWidthMd = `${this.styleid} > .item {flex: 0 0 ${100 /
        +this.inputs.grid.md}%; width: ${100 / +this.inputs.grid.md}%}`;
      const itemWidthLg = `${this.styleid} > .item {flex: 0 0 ${100 /
        +this.inputs.grid.lg}%; width: ${100 / +this.inputs.grid.lg}%}`;

      itemStyle = `@media (max-width:767px){${itemWidthXs}}
                    @media (min-width:768px){${itemWidthSm}}
                    @media (min-width:992px){${itemWidthMd}}
                    @media (min-width:1200px){${itemWidthLg}}`;
    } else {
      itemStyle = `${this.styleid} .item {flex: 0 0 ${
        this.inputs.grid.all
      }px; width: ${this.inputs.grid.all}px;}`;
    }

    this.renderer.addClass(this.carousel, this.token);
    if (this.vertical.enabled) {
      this.renderer.addClass(
        this.carouselItemsContainer.nativeElement,
        'carouselvertical'
      );
      this.renderer.setStyle(
        this.carouselMainEl.nativeElement,
        'height',
        `${this.vertical.height}px`
      );
    }

    // tslint:disable-next-line:no-unused-expression
    this.RTL &&
      !this.vertical.enabled &&
      this.renderer.addClass(this.carousel, 'carouselrtl');
    this._createStyleElem(`${dism} ${itemStyle}`);
    this._storeCarouselData();
  }

  /** logic to scroll the carousel step 1 */
  private _carouselScrollOne(Btn: number): void {
    let itemSpeed = this.speed;
    let translateXval,
      currentSlide = 0;
    const touchMove = Math.ceil(this.dexVal / this.itemWidth);
    this._setStyle(this.carouselItemsContainer.nativeElement, 'transform', '');

    if (this.pointIndex === 1) {
      return;
    } else if (Btn === 0 && ((!this.loop && !this.isFirst) || this.loop)) {
      const slide = this.slideItems * this.pointIndex;

      const currentSlideD = this.currentSlide - this.slideItems;
      const MoveSlide = currentSlideD + this.slideItems;
      this._btnBoolean(0, 1);
      if (this.currentSlide === 0) {
        currentSlide = this.dataSource.length - this.items;
        itemSpeed = 400;
        this._btnBoolean(0, 1);
      } else if (this.slideItems >= MoveSlide) {
        currentSlide = translateXval = 0;
        this._btnBoolean(1, 0);
      } else {
        this._btnBoolean(0, 0);
        if (touchMove > this.slideItems) {
          currentSlide = this.currentSlide - touchMove;
          itemSpeed = 200;
        } else {
          currentSlide = this.currentSlide - this.slideItems;
        }
      }
      this._carouselScrollTwo(Btn, currentSlide, itemSpeed);
    } else if (Btn === 1 && ((!this.loop && !this.isLast) || this.loop)) {
      if (
        this.dataSource.length <=
          this.currentSlide + this.items + this.slideItems &&
        !this.isLast
      ) {
        currentSlide = this.dataSource.length - this.items;
        this._btnBoolean(0, 1);
      } else if (this.isLast) {
        currentSlide = translateXval = 0;
        itemSpeed = 400;
        this._btnBoolean(1, 0);
      } else {
        this._btnBoolean(0, 0);
        if (touchMove > this.slideItems) {
          currentSlide =
            this.currentSlide + this.slideItems + (touchMove - this.slideItems);
          itemSpeed = 200;
        } else {
          currentSlide = this.currentSlide + this.slideItems;
        }
      }
      this._carouselScrollTwo(Btn, currentSlide, itemSpeed);
    }

    // cubic-bezier(0.15, 1.04, 0.54, 1.13)
  }

  /** logic to scroll the carousel step 2 */
  private _carouselScrollTwo(
    Btn: number,
    currentSlide: number,
    itemSpeed: number
  ): void {
    // tslint:disable-next-line:no-unused-expression

    if (this.dexVal !== 0) {
      const val = Math.abs(this.touch.velocity);
      let somt = Math.floor(
        (this.dexVal / val / this.dexVal) * (this.deviceWidth - this.dexVal)
      );
      somt = somt > itemSpeed ? itemSpeed : somt;
      itemSpeed = somt < 200 ? 200 : somt;
      this.dexVal = 0;
    }
    if (this.withAnim) {
      this._setStyle(
        this.carouselItemsContainer.nativeElement,
        'transition',
        `transform ${itemSpeed}ms ${this.inputs.easing}`
      );
      this.inputs.animation &&
        this._carouselAnimator(
          Btn,
          currentSlide + 1,
          currentSlide + this.items,
          itemSpeed,
          Math.abs(this.currentSlide - currentSlide)
        );
    } else {
      this._setStyle(this.carouselItemsContainer.nativeElement, 'transition', ``);
    }
    // console.log(this.dataSource);
    this.itemLength = this.dataSource.length;
    this._transformStyle(currentSlide);
    this.currentSlide = currentSlide;
    this.onMove.emit(this);
    this._carouselPointActiver();
    this._carouselLoadTrigger();
    this.withAnim = true;
    // if (currentSlide === 12) {
    //   this._switchDataSource(this.dataSource);
    // }
  }

  /** boolean function for making isFirst and isLast */
  private _btnBoolean(first: number, last: number) {
    this.isFirst = !!first;
    this.isLast = !!last;
  }

  private _transformString(grid: string, slide: number): string {
    let collect = '';
    collect += `${this.styleid} { transform: translate3d(`;

    if (this.vertical.enabled) {
      this.transform[grid] =
        (this.vertical.height / this.inputs.grid[grid]) * slide;
      collect += `0, -${this.transform[grid]}px, 0`;
    } else {
      this.transform[grid] = (100 / this.inputs.grid[grid]) * slide;
      collect += `${this.directionSym}${this.transform[grid]}%, 0, 0`;
    }
    collect += `); }`;
    return collect;
  }

  /** set the transform style to scroll the carousel  */
  private _transformStyle(slide: number): void {
    let slideCss = '';
    if (this.type === 'responsive') {
      slideCss = `@media (max-width: 767px) {${this._transformString(
        'xs',
        slide
      )}}
      @media (min-width: 768px) {${this._transformString('sm', slide)} }
      @media (min-width: 992px) {${this._transformString('md', slide)} }
      @media (min-width: 1200px) {${this._transformString('lg', slide)} }`;
    } else {
      this.transform.all = this.inputs.grid.all * slide;
      slideCss = `${this.styleid} { transform: translate3d(${
        this.directionSym
      }${this.transform.all}px, 0, 0);`;
    }
    this.carouselCssNode.innerHTML = slideCss;
  }

  /** this will trigger the carousel to load the items */
  private _carouselLoadTrigger(): void {
    if (typeof this.inputs.load === 'number') {
      this.dataSource.length - this.load <= this.currentSlide + this.items &&
        this.carouselLoad.emit(this.currentSlide);
    }
  }

  /** generate Class for each carousel to set specific style */
  private _generateID(): string {
    let text = '';
    const possible =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < 6; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return `carousel${text}`;
  }

  /** handle the auto slide */
  private _carouselInterval(): void {
    const container = this.carouselMainEl.nativeElement;
    if (this.interval && this.loop) {
      this.listener4 = this.renderer.listen('window', 'scroll', () => {
        clearTimeout(this.onScrolling);
        this.onScrolling = setTimeout(() => {
          this._onWindowScrolling();
        }, 600);
      });

      const play$ = fromEvent(container, 'mouseleave').pipe(mapTo(1));
      const pause$ = fromEvent(container, 'mouseenter').pipe(mapTo(0));

      const touchPlay$ = fromEvent(container, 'touchstart').pipe(mapTo(1));
      const touchPause$ = fromEvent(container, 'touchend').pipe(mapTo(0));

      const interval$ = interval(this.inputs.interval.timing).pipe(mapTo(1));

      setTimeout(() => {
        this.carouselInt = merge(
          play$,
          touchPlay$,
          pause$,
          touchPause$,
          this.carouselIntervalController$
        )
          .pipe(
            startWith(1),
            switchMap(val => {
              this.isHovered = !val;
              this.cdr.markForCheck();
              return val ? interval$ : empty();
            })
          )
          .subscribe(res => {
            this._carouselScrollOne(1);
          });
      }, this.interval.initialDelay);
    }
  }

  private _updateItemIndexContextAni() {
    const viewContainer = this.carouselNodeOutlet.viewContainer;
    for (
      let renderIndex = 0, count = viewContainer.length;
      renderIndex < count;
      renderIndex++
    ) {
      const viewRef = viewContainer.get(renderIndex) as any;
      const context = viewRef.context as any;
      context.count = count;
      context.first = renderIndex === 0;
      context.last = renderIndex === count - 1;
      context.even = renderIndex % 2 === 0;
      context.odd = !context.even;
      context.index = renderIndex;
    }
  }

  /** animate the carousel items */
  private _carouselAnimator(
    direction: number,
    start: number,
    end: number,
    speed: number,
    length: number,
    viewContainer = this.carouselNodeOutlet.viewContainer
  ): void {
    let val = length < 5 ? length : 5;
    val = val === 1 ? 3 : val;
    const collectIndex = [];

    if (direction === 1) {
      for (let i = start - 1; i < end; i++) {
        collectIndex.push(i);
        val = val * 2;
        const viewRef = viewContainer.get(i) as any;
        const context = viewRef.context as any;
        context.animate = { value: true, params: { distance: val } };
      }
    } else {
      for (let i = end - 1; i >= start - 1; i--) {
        collectIndex.push(i);
        val = val * 2;
        const viewRef = viewContainer.get(i) as any;
        const context = viewRef.context as any;
        context.animate = { value: true, params: { distance: -val } };
      }
    }
    this.cdr.markForCheck();
    setTimeout(() => {
      this._removeAnimations(collectIndex);
    }, speed * 0.7);
  }

  private _removeAnimations(indexs: number[]) {
    const viewContainer = this.carouselNodeOutlet.viewContainer;
    indexs.forEach(i => {
      const viewRef = viewContainer.get(i) as any;
      const context = viewRef.context as any;
      context.animate = { value: false, params: { distance: 0 } };
    });
    this.cdr.markForCheck();
  }

  /** Short form for setElementStyle */
  private _setStyle(el: any, prop: any, val: any): void {
    this.renderer.setStyle(el, prop, val);
  }

  /** For generating style tag */
  private _createStyleElem(datas?: string) {
    const styleItem = this.renderer.createElement('style');
    if (datas) {
      const styleText = this.renderer.createText(datas);
      this.renderer.appendChild(styleItem, styleText);
    }
    this.renderer.appendChild(this.carousel, styleItem);
    return styleItem;
  }
}
