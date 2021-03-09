import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { Category } from './food-order/../../models/Category';
import { Product } from './food-order/../../models/Product';

import { faEye, faShoppingCart, faShoppingBag } from '@fortawesome/free-solid-svg-icons';

import { DataBindService } from './../databind.service';
import { MalihuScrollbarService } from 'ngx-malihu-scrollbar';

import { ApiService } from './../api.service';

@Component({
  selector: 'food-app-catalogue',
  templateUrl: './catalogue.component.html',
  styleUrls: ['./catalogue.component.css']
})
export class CatalogueComponent implements OnInit, AfterViewInit, OnDestroy {

  iconEye = faEye;
  iconCart = faShoppingCart;
  iconBag = faShoppingBag;

  categories:Category[];
  product:Product[];
  leftNavDisabled = false;
  rightNavDisabled = false;
  idx = 0;
  details: any[] = [];
  modalDataTest:any = [];
  data = {};
  storeID:number = 2;

    constructor(
        private _databindService: DataBindService, 
        private route: Router,
        private activatedRoute: ActivatedRoute,
        private mScrollbarService: MalihuScrollbarService,
        private apiService: ApiService
    ) { 
        
        // get url parameter style e.g http://localhost:4200/catalogue?store_id=3
        this.activatedRoute.queryParams.subscribe(params => {
            let date = params['store_id'];
            console.log(date); // Print the parameter to the console. 
        });

        // url path style e.g http://localhost:4200/catalogue/3
        // this.activatedRoute.params.subscribe(params => {
        //     let date = params['store_id'];
        //     console.log(date); // Print the parameter to the console. 
        // });
    }

    ngOnInit(): void {
        this.product = this._databindService.getProduct();
        this.categories = this._databindService.getCategories();
        this.modalDataTest = this._databindService.getProduct();
        
        this.getProduct();
    }
  

    ngAfterViewInit(){
        this.mScrollbarService.initScrollbar(document.body, { axis: 'y', theme: 'dark-3', scrollButtons: { enable: true } });
        this.mScrollbarService.initScrollbar('#scrollable2', { axis: 'x', theme: 'dark-thin', scrollButtons: { enable: true } });
    }

    ngOnDestroy() {
        // custom cleanup
        this.mScrollbarService.destroy(document.body);
        this.mScrollbarService.destroy('#scrollable2');
    }

    goTo(event){
        // console.log('ditekan mengenai');
        this.route.navigate(['checkout']);   
    }

    getProduct(){
        this.apiService.getProductSByStoreID(this.storeID).subscribe((res: any) => {
            console.log(res)
            if (res.message) {
                console.log('data: ', res.data.content);
            } else {

            }
        }, error => {
            console.log(error)
        }) 
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

}
