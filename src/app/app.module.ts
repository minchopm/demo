import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material-module/material-module.module';
import { NavbarComponent } from './layouts/navbar/navbar.component';
import { HomeComponent } from './layouts/home/home.component';
import { AppRoutingModule } from './app-routing.module';
import { ListComponent } from './layouts/list/list.component';
import { AccountComponent } from './layouts/account/account.component';
import { CarouselModule } from './commons/carousel-module/carousel.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxGalleryModule } from 'ngx-gallery';
import { GalleryComponent } from './layouts/gallery/gallery.component';
import { ProfilesComponent } from './layouts/profiles/profiles.component';
import { NgxLocalStorageModule } from 'ngx-localstorage';
import { NotificationComponent } from './layouts/notification/notification.component';

@NgModule({
  declarations: [
    AccountComponent,
    AppComponent,
    GalleryComponent,
    HomeComponent,
    ListComponent,
    NavbarComponent,
    ProfilesComponent,
    NotificationComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    CarouselModule,
    FormsModule,
    FlexLayoutModule,
    MaterialModule,
    NgxGalleryModule,
    NgxLocalStorageModule.forRoot(),
    ReactiveFormsModule,
  ],
  entryComponents: [NotificationComponent],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
