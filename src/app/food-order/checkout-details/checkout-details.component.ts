import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from './../api.service';
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
export class CheckoutDetailsComponent implements OnInit, AfterViewInit, OnDestroy {

    cartList:CartList[];
    subtotal:number = 0;
    feetotal:number = 0;
    grandtotal:number = 0;
    trxid: any;

    iconMoney = faMoneyBillAlt;

    constructor(
        private _databindService: DataBindService,
        private mScrollbarService: MalihuScrollbarService,
        private route: Router,
        private apiService: ApiService,
        private datePipe: DatePipe
    ) { }

    ngOnInit(): void {
        console.log('ngOnInit');
        this.cartList = this._databindService.getCartList();
        this.countPrice(this.cartList);
    }

    ngAfterViewInit(){
        console.log("after view init");
        // this.mScrollbarService.initScrollbar(document.body, { axis: 'y', theme: 'dark-3', scrollButtons: { enable: true } });
        this.mScrollbarService.initScrollbar('#scrollable4', { axis: 'y', theme: 'dark-thin', scrollButtons: { enable: true } });
    }

    ngOnDestroy() {
        // custom cleanup
        // this.mScrollbarService.destroy(document.body);
        this.mScrollbarService.destroy('#scrollable4');
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

    goPay(e){
        let dateTime = new Date()

        this.trxid = this.datePipe.transform(dateTime, "yyyyMMddhhmmss")

        let data = {
            "customerId": 1,
            "customerName": "Nazrul",
            "productCode": "document",
            "systemTransactionId": this.trxid,
            "transactionId": this.trxid,	
            "paymentAmount": 3
        }

        this.apiService.postPaymentLink(data).subscribe((res: any) => {
            console.log('raw resp:', res.data.paymentLink)
            if (res.message) {

                let paymentLink = res.data.paymentLink;
                // window.open(paymentLink, "_blank");
                window.location.href = paymentLink;
            } else {
                // condition if required for different type of response message 
            }
        }, error => {
            console.log(error)
        }) 
    }

}
