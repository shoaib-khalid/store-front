import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataBindService {

  constructor() { }

  getStepper(){
    return [
      {
        id: 1,
        name: 'Order',
        status: true,
        router: 'catalogue'
      },
      {
        id: 2,
        name: 'Checkout',
        status: false,
        router: 'checkout'
      },
      {
        id: 3,
        name: 'Done',
        status: false,
        router: 'done'
      }
    ]
  }


  getCategories(){
    return [
      {
        category: 'Food',
        available: true,
        img: 'banner-sample5.jpg' 
      },
      {
        category: 'Beverages',
        available: true,
        img: 'banner-sample4.jpg' 
      },
      {
        category: 'Special',
        available: false,
        img: 'banner-sample3.jpg' 
      },
      {
        category: "All Category",
        available: true,
        img: 'banner-sample6.jpg' 
      },
      {
        category: "All Category",
        available: true,
        img: 'banner-sample3.jpg' 
      },
      {
        category: "All Category",
        available: true,
        img: 'banner-sample2.jpg' 
      },
      {
        category: "All Category",
        available: true,
        img: 'banner-sample7.jpg' 
      },
      {
        category: 'Food',
        available: true,
        img: 'banner-sample3.jpg' 
      },
      {
        category: 'Beverages',
        available: true,
        img: 'banner-sample4.jpg' 
      },
      {
        category: 'Special',
        available: false,
        img: 'banner-sample5.jpg' 
      },
      {
        category: 'Addon',
        available: false,
        img: 'banner-sample4.jpg' 
      },
      {
        category: 'Ala Carte',
        available: true,
        img: 'banner-sample7.jpg' 
      }
    ]
  }


  getProduct(){
    return [
      {
        productid: 1,
        title: 'Ayam Goreng',
        desc: 'Ayam Goreng Rangup lah di masak bersama ais krim',
        price: 10,
        image: 'assets/image/food-sample1.jpg',
        status: true
      },
      {
        productid: 2,
        title: 'Burger King',
        desc: 'Ayam Goreng Rangup lah di masak bersama ais krim',
        price: 7.5,
        image: 'assets/image/food-sample2.jpg',
        status: true
      },
      {
        productid: 3,
        title: 'Sushi Empire',
        desc: 'Ayam Goreng Rangup lah di masak bersama ais krim',
        price: 25,
        image: 'assets/image/food-sample3.jpg',
        status: true
      },
      {
        productid: 4,
        title: 'Ayam Goreng',
        desc: 'Ayam Goreng Rangup lah di masak bersama ais krim',
        price: 10,
        image: 'assets/image/food-sample1.jpg',
        status: true
      },
      {
        productid: 5,
        title: 'Burger King',
        desc: 'Ayam Goreng Rangup lah di masak bersama ais krim',
        price: 7.5,
        image: 'assets/image/food-sample2.jpg',
        status: true
      },
      {
        productid: 6,
        title: 'Sushi Empire',
        desc: 'Ayam Goreng Rangup lah di masak bersama ais krim',
        price: 12.5,
        image: 'assets/image/food-sample3.jpg',
        status: true
      },
      {
        productid: 7,
        title: 'Ayam Goreng',
        desc: 'Ayam Goreng Rangup lah di masak bersama ais krim',
        price: 10,
        image: 'assets/image/food-sample1.jpg',
        status: true
      },
      {
        productid: 8,
        title: 'Burger King',
        desc: 'Ayam Goreng Rangup lah di masak bersama ais krim',
        price: 7.5,
        image: 'assets/image/food-sample2.jpg',
        status: true
      },
      {
        productid: 9,
        title: 'Sushi Empire',
        desc: 'Ayam Goreng Rangup lah di masak bersama ais krim',
        price: 12.5,
        image: 'https://p7.hiclipart.com/preview/230/838/351/hyderabadi-biryani-indian-cuisine-hyderabadi-cuisine-barbecue-barbecue-thumbnail.jpg',
        status: true
      }
    ]
  }


  getCartList(){
    return [
        {
            productid: 1,
            title: 'Ayam Goreng',
            quantity: 5,
            unitprice: 7.5
        },
        {
            productid: 2,
            title: 'Burger King',
            quantity: 2,
            unitprice: 10.5
        },
        {
            productid: 3,
            title: 'Sushi King',
            quantity: 7,
            unitprice: 2
        },
        {
            productid: 4,
            title: 'Kambing Bakar',
            quantity: 2,
            unitprice: 15.5
        },
        {
            productid: 5,
            title: 'Fresh Orange',
            quantity: 5,
            unitprice: 4.5
        },
        {
            productid: 6,
            title: 'Coconut Milk',
            quantity: 1,
            unitprice: 1.5
        }
    ]
  }
}
