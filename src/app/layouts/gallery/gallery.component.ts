import { Component, OnInit } from '@angular/core';
import { NgxGalleryImage, NgxGalleryOptions } from 'ngx-gallery';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss']
})
export class GalleryComponent implements OnInit {
  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[];

  ngOnInit(): void {

    this.galleryOptions = [
      {
        width: '100%',
        height: '30%',
        thumbnails: false,
        imageAutoPlayInterval: 5000,
        imageAutoPlayPauseOnHover: true,
        preview: true,
        imageAutoPlay: true,
        previewFullscreen: true,
        imageDescription: true, previewCloseOnEsc: true, previewCloseOnClick: true
      }] as any;

    this.galleryImages = [
      {
        small: 'https://www.neterra.net/img/banners/11_en_image.png',
        medium: 'https://www.neterra.net/img/banners/11_en_image.png',
        big: 'https://www.neterra.net/img/banners/11_en_image.png',
        description: 'Нетера е независим телеком оператор за стандартни и комплексни услуги и проекти в Европа повече от 20 години.'
      },
      {
        small: 'https://www.neterra.net/img/banners/2_en_image.png',
        medium: 'https://www.neterra.net/img/banners/2_en_image.png',
        big: 'https://www.neterra.net/img/banners/2_en_image.png',
        description: 'Нетера предлага надеждни телеком услуги за бизнеса, включително интернет достъп, частни мрежи,' +
        ' защита от DDoS атаки, пренос на телевизионни канали.'
      },
      {
        small: 'https://www.neterra.net/img/banners/3_en_image.png',
        medium: 'https://www.neterra.net/img/banners/3_en_image.png',
        big: 'https://www.neterra.net/img/banners/3_en_image.png',
        description: 'Нетера е независим телеком оператор за стандартни и комплексни услуги и проекти в Европа повече от 20 години.'
      },
      {
        small: 'https://www.neterra.net/img/banners/4_en_image.png',
        medium: 'https://www.neterra.net/img/banners/4_en_image.png',
        big: 'https://www.neterra.net/img/banners/4_en_image.png',
        description: 'Нетера предлага надеждни телеком услуги за бизнеса, включително интернет достъп, частни мрежи,' +
        ' защита от DDoS атаки, пренос на телевизионни канали.'
      },
      {
        small: 'https://www.neterra.net/img/banners/5_en_image.png',
        medium: 'https://www.neterra.net/img/banners/5_en_image.png',
        big: 'https://www.neterra.net/img/banners/5_en_image.png',
        description: 'Нетера предлага надеждни телеком услуги за бизнеса, включително интернет достъп, частни мрежи,' +
        ' защита от DDoS атаки, пренос на телевизионни канали.'
      }
    ] as any;
  }
}
