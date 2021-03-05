import { Component, OnInit, AfterViewInit } from '@angular/core';
// model 
import { CartList } from './food-order/../../models/CartList';
// services
import { DataBindService } from './../databind.service';

import { faMoneyBillAlt } from '@fortawesome/free-solid-svg-icons';

import { MalihuScrollbarService } from 'ngx-malihu-scrollbar';

@Component({
  selector: 'app-checkout-details',
  templateUrl: './checkout-details.component.html',
  styleUrls: ['./checkout-details.component.css']
})
export class CheckoutDetailsComponent implements OnInit {

    cartList:CartList[];
    subtotal:number = 0;
    feetotal:number = 0;
    grandtotal:number = 0;

    iconMoney = faMoneyBillAlt;

    constructor(
        private _databindService: DataBindService,
        private mScrollbarService: MalihuScrollbarService
    ) { }

    ngOnInit(): void {

        console.log('ngOnInit');
        this.cartList = this._databindService.getCartList();

        this.countPrice(this.cartList);
    }

    ngAfterViewInit(){
        console.log("after view init");
        this.mScrollbarService.initScrollbar(document.body, { axis: 'y', theme: 'dark-3', scrollButtons: { enable: true } });
        this.mScrollbarService.initScrollbar('#scrollable4', { axis: 'y', theme: 'dark', scrollButtons: { enable: true } });
    }

    countPrice(list:any){

        console.log('countPrice');

        list.forEach(item => {

            this.subtotal = this.subtotal + (item.quantity * item.unitprice);
            
            console.log('current total: ' + this.subtotal);
        });

        // sample total fee = 5% out of total subtotal 
        this.feetotal = this.subtotal * 0.05;

        // sample grandtotal = subtotal deduct with fees
        this.grandtotal = this.subtotal - this.feetotal;

    }

}
