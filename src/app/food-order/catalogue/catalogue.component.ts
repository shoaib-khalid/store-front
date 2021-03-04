import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Category } from './food-order/../../models/Category';
import { Product } from './food-order/../../models/Product';

import { faEye, faShoppingCart, faShoppingBag } from '@fortawesome/free-solid-svg-icons';

import { DataBindService } from './../databind.service';
import { MalihuScrollbarService } from 'ngx-malihu-scrollbar';
import { ViewportScroller } from '@angular/common';

@Component({
  selector: 'food-app-catalogue',
  templateUrl: './catalogue.component.html',
  styleUrls: ['./catalogue.component.css']
})
export class CatalogueComponent implements OnInit {

  iconEye = faEye;
  iconCart = faShoppingCart;
  iconBag = faShoppingBag;

  categories:Category[];
  product:Product[];
  leftNavDisabled = false;
  rightNavDisabled = false;
  idx = 0;
  details: any[] = [];
  // modalDataTest:Product[];
  modalDataTest:any = []

  constructor(
    private _databindService: DataBindService, 
    private route: Router,
    private mScrollbarService: MalihuScrollbarService
  ) { }

  ngOnInit(): void {
    this.product = this._databindService.getProduct();
    this.categories = this._databindService.getCategories();
    this.modalDataTest = this._databindService.getProduct();
    // malihu scrollbar affecting View scroller, therefore please put it in specific id or class tag instead of body tag.
    // this.mScrollbarService.initScrollbar(document.body, { axis: 'y', theme: 'dark-3', scrollButtons: { enable: true } });
  }

  onGetDetails(productid){
    console.log(productid)

    this.modalDataTest.map((modalDataTest, index) => {
      index++;
      if(index == productid){
        console.log(modalDataTest);

        this.details = modalDataTest;
        return this.details;
        // console.log(details);
      }
    })
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

  goTo(event){
    // console.log('ditekan mengenai');
    this.route.navigate(['checkout']);
  }


}
