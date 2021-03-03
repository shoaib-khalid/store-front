import { Component, OnInit, Input } from '@angular/core';

import { faShoppingCart, faArrowCircleLeft } from '@fortawesome/free-solid-svg-icons';
import { NgxGalleryOptions, NgxGalleryImage, NgxGalleryAnimation } from 'ngx-gallery-9';
// using ngx-gallery-9

@Component({
  selector: 'app-modal-product',
  templateUrl: './modal-product.component.html',
  styleUrls: ['./modal-product.component.css']
})
export class ModalProductComponent implements OnInit {
  @Input() details: any;

  value: number;
  price: any = 'RM 10.00';

  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[];

  iconCart = faShoppingCart;
  iconBack = faArrowCircleLeft;

  constructor() {
  }

  ngOnInit(): void {

    this.galleryOptions = [
        {
            width: '200px',
            height: '200px',
            thumbnailsColumns: 3,
            imageAnimation: NgxGalleryAnimation.Zoom,
            thumbnailsArrows: true,
            // previewDownload: true,
            imageArrowsAutoHide: true, 
            thumbnailsArrowsAutoHide: true
        },
        // max-width 767 Mobile configuration
        {
            breakpoint: 767,
            thumbnailsColumns: 2,
            width: '100%',
            height: '250px',
            imagePercent: 80,
            thumbnailsPercent: 30,
            thumbnailsMargin: 10,
            thumbnailMargin: 5,
        }
    ];

    // when product id is triggered, kindly fetch product image
    this.galleryImages = [
        {
            small: 'assets/image/food-sample1.jpg',
            medium: 'assets/image/food-sample1.jpg',
            big: 'assets/image/food-sample1.jpg'
        },
        {
            small: 'assets/image/food-sample2.jpg',
            medium: 'assets/image/food-sample2.jpg',
            big: 'assets/image/food-sample2.jpg'
        },
        {
            small: 'assets/image/food-sample3.jpg',
            medium: 'assets/image/food-sample3.jpg',
            big: 'assets/image/food-sample3.jpg'
        },
        {
            small: 'assets/image/food-sample2.jpg',
            medium: 'assets/image/food-sample2.jpg',
            big: 'assets/image/food-sample2.jpg'
        },
        {
            small: 'assets/image/food-sample1.jpg',
            medium: 'assets/image/food-sample1.jpg',
            big: 'assets/image/food-sample1.jpg'
        },
        {
            small: 'assets/image/food-sample3.jpg',
            medium: 'assets/image/food-sample3.jpg',
            big: 'assets/image/food-sample3.jpg'
        }
    ];
    
  }
  
}
