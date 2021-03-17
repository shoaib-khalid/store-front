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

    // categories:Category[];
    //   product:Product[];
    categories:any;
    product:any;
    leftNavDisabled = false;
    rightNavDisabled = false;
    idx = 0;
    details: any[] = [];
    modalDataTest:any = [];
    data = {};
    storeID:any;
    priceObj = [];
    clusterPriceArr = [];
    minVal:any;
    detailPrice:any = '0.00';

    constructor(
        private _databindService: DataBindService, 
        private route: Router,
        private activatedRoute: ActivatedRoute,
        private mScrollbarService: MalihuScrollbarService,
        private apiService: ApiService
    ) { 
        
        // get url parameter style e.g http://localhost:4200/catalogue?store_id=3
        this.activatedRoute.queryParams.subscribe(params => {
            this.storeID = params['store_id'];
            console.log(this.storeID); // Print the parameter to the console. 
        });

        // url path style e.g http://localhost:4200/catalogue/3
        // this.activatedRoute.params.subscribe(params => {
        //     let date = params['store_id'];
        //     console.log(date); // Print the parameter to the console. 
        // });
    }

    ngOnInit(): void {
        // this.product = this._databindService.getProduct();
        // this.categories = this._databindService.getCategories();
        this.modalDataTest = this._databindService.getProduct();

        // console.log('modal details: ', this.details);
        
        this.getProduct();
        this.getCategory();
    }
  
    ngAfterViewInit(){
        // this.mScrollbarService.initScrollbar(document.body, { axis: 'y', theme: 'dark-3', scrollButtons: { enable: true } });
        this.mScrollbarService.initScrollbar('#scrollable2', { axis: 'x', theme: 'dark-thin', scrollButtons: { enable: true } });
    }

    ngOnDestroy() {
        // custom cleanup
        // this.mScrollbarService.destroy(document.body);
        this.mScrollbarService.destroy('#scrollable2');
    }

    goTo(event){
        // console.log('ditekan mengenai');
        this.route.navigate(['checkout']);   
    }

    getCategory(){
        this.apiService.getCategoryByStoreID(this.storeID).subscribe((res: any) => {

            console.log('category obj: ', res)
            if (res.message){
                this.categories = res.data.content;

                console.log('category obj: ', this.categories);
            }else{

            }

        }, error => {
            console.log(error)
        }) 
    }

    getProduct(){
        this.apiService.getProductSByStoreID(this.storeID).subscribe((res: any) => {
            console.log('raw resp:', res)
            if (res.message) {
                this.product = res.data.content;
                console.log('product: ', this.product);
                // console.log('price: ', this.product[0].productInventories[1]);

                let productObj = this.product;

                productObj.forEach( obj => {
                    // console.log(obj);

                    let productID = obj.id;
                    let inventoryArr = obj.productInventories;

                    if(inventoryArr.length !== 0){
                        inventoryArr.forEach( inventoryObj => {
                            // creating a collection of price array base on cluster item 
                            this.clusterPriceArr.push(inventoryObj.price);
                        });
                        // checking the minimum price of each cluster item 
                        this.minVal = this.clusterPriceArr.reduce((a, b)=>Math.min(a, b));
                    }else{
                        this.minVal = 0;
                    }
                
                    // creating an object of a specific product item 
                    let data = {
                        product_id : productID,
                        minPrice : this.minVal
                    }

                    // populate product id as identifier of item and its min price into a new final object collection 
                    this.priceObj.push(data);
                    
                    console.log('Final Object: ', this.priceObj);
                });

            } else {
                // condition if required for different type of response message 
            }
        }, error => {
            console.log(error)
        }) 
    }

    onGetDetails(productid){
        console.log('product id: ', productid)

        // console.log('product obj: ', this.product);

        // this.product.map(product => {
        //     if(product.id == productid){
        //         console.log('selected product: ', product);
        //         this.details = product;
        //         return this.details;
        //     }
        // })


        this.apiService.getProductSByProductID(productid).subscribe((res: any) => {

            console.log('product details:', res.data);

            let product_details = res.data;

            if (res.message) {
                this.details = product_details;
                this.detailPrice = product_details.productInventories.price;
            } else {

            }

        }, error => {
            console.log(error)
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
