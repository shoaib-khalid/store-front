import { Component, OnInit, Input, AfterViewInit } from '@angular/core';

import { faShoppingCart, faArrowCircleLeft } from '@fortawesome/free-solid-svg-icons';
import { NgxGalleryOptions, NgxGalleryImage, NgxGalleryAnimation } from 'ngx-gallery-9';
// using ngx-gallery-9

import { ApiService } from './../api.service';

@Component({
  selector: 'app-modal-product',
  templateUrl: './modal-product.component.html',
  styleUrls: ['./modal-product.component.css']
})
export class ModalProductComponent implements OnInit, AfterViewInit {
  @Input() details: any;
  @Input() detailPrice: any;
  @Input() galleryImagesInit: string;

  value: number;
  price: any = '10.00';

  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[];

  iconCart = faShoppingCart;
  iconBack = faArrowCircleLeft;

  cartExist:boolean = false;
  cartCount:number;
  cart:any;
  cartitemDetails:any;
  cartitemDetailsCount:number;
  cartItemCount:number;

  senderID:any;
  refID:any;
  storeID:any;

  constructor(
    private apiService: ApiService
  ) {
  }

  ngOnInit(): void {

    this.senderID = localStorage.getItem('sender_id');
    this.refID = localStorage.getItem('ref_id');
    this.storeID = localStorage.getItem('store_id');

    // console.log('modal details: ', this.details);

    // this.galleryImagesInit = this.galleryImages;

     // when product id is triggered, kindly fetch product image
    
    // console.log('test: ' + this.galleryImagesInit)

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

    this.galleryImages = [
        {
            small: ''+this.galleryImagesInit+'',
            medium: ''+this.galleryImagesInit+'',
            big: ''+this.galleryImagesInit+''
        }
    ];

  }

    ngAfterViewInit(){
        // this.mScrollbarService.initScrollbar(document.body, { axis: 'y', theme: 'dark-3', scrollButtons: { enable: true } });
        // this.mScrollbarService.initScrollbar('#scrollable2', { axis: 'x', theme: 'dark-thin', scrollButtons: { enable: true } });
        console.log('detailPrice: ' + this.galleryImagesInit)
    }


    addToCart(event, productID, quantity){

        let qty = 1;
        // replace qty if quantity param exist 
        quantity ? qty = quantity : console.log('qty no change');

        let data = {
            "cartId": "3",
            "id": "",
            "itemCode": productID,
            "productId": productID,
            "quantity": qty
        }

        if(this.cartExist == true){
            
            this.apiService.postAddToCart(data).subscribe((res: any) => {

            }, error => {
                console.log(error)
            }) 

        }else{

            this.apiService.getCartList(this.senderID).subscribe((res: any) => {

                console.log('cart obj: ', res.data.content)
                if (res.message){
    
                    this.cart = res.data.content;
                    // if cart empty then initiate cart API
                    this.cartCount = this.cart.length;
    
                    if(this.cartCount > 0){
                        this.cartExist = true;
    
                        let cartID = this.cart[0].id;
    
                        console.log('cart id : ' + cartID)
    
                        // check count Item in Cart 
                        this.apiService.getCartItemByCartID(cartID).subscribe((res: any) => {
                            console.log('cart item by cart ID: ', res.data.content)
    
                            if (res.message){
                                this.cartitemDetails = res.data.content;
                                this.cartitemDetailsCount = this.cartitemDetails.length;

                                // add to cart 
                                this.apiService.postAddToCart(data).subscribe((res: any) => {

                                }, error => {
                                    console.log(error)
                                }) 
    
                            } else {
    
                            }
    
                        }, error => {
                            console.log(error)
                        }) 
    
                    }else{
                        this.cartItemCount = 0;
                    }
                    
                }else{
    
                }
            }, error => {
                console.log(error)
            }) 
        }  
    }
  
}
