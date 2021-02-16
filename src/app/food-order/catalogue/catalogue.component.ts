import { Component, OnInit } from '@angular/core';

import { Category } from './food-order/../../models/Category';
import { Product } from './food-order/../../models/Product';

import { faEye, faShoppingCart } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'food-app-catalogue',
  templateUrl: './catalogue.component.html',
  styleUrls: ['./catalogue.component.css']
})
export class CatalogueComponent implements OnInit {

  iconEye = faEye;
  iconCart = faShoppingCart;

  categories:Category[];
  product:Product[];

  leftNavDisabled = false;
  rightNavDisabled = false;
  idx = 0;

  constructor() { }

  ngOnInit(): void {

    this.product = [
      {
        productid: 1,
        title: 'Ayam Goreng',
        price: 10,
        image: 'food-sample1.jpg',
        status: true
      },
      {
        productid: 2,
        title: 'Burger King',
        price: 7.5,
        image: 'food-sample2.jpg',
        status: true
      },
      {
        productid: 3,
        title: 'Sushi Empire',
        price: 25,
        image: 'food-sample3.jpg',
        status: true
      },
      {
        productid: 4,
        title: 'Ayam Goreng',
        price: 10,
        image: 'food-sample1.jpg',
        status: true
      },
      {
        productid: 5,
        title: 'Burger King',
        price: 7.5,
        image: 'food-sample2.jpg',
        status: true
      },
      {
        productid: 6,
        title: 'Sushi Empire',
        price: 12.5,
        image: 'food-sample3.jpg',
        status: true
      },
      {
        productid: 7,
        title: 'Ayam Goreng',
        price: 10,
        image: 'food-sample1.jpg',
        status: true
      },
      {
        productid: 8,
        title: 'Burger King',
        price: 7.5,
        image: 'food-sample2.jpg',
        status: true
      },
      {
        productid: 9,
        title: 'Sushi Empire',
        price: 12.5,
        image: 'food-sample3.jpg',
        status: true
      }
    ]

    this.categories = [
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


  onIndexChanged(idx) {
    this.idx = idx;
    // console.log('current index: ' + idx);
  }

  onDragScrollInitialized() {
    // console.log('first demo drag scroll has been initialized.');
  }

  leftBoundStat(reachesLeftBound: boolean) {
    this.leftNavDisabled = reachesLeftBound;
  }

  rightBoundStat(reachesRightBound: boolean) {
    this.rightNavDisabled = reachesRightBound;
  }

  onSnapAnimationFinished() {
    // console.log('snap animation finished');
  }

  onDragStart() {
    // console.log('drag start');
  }

  onDragEnd() {
    // console.log('drag end');
  }

}
