import { Component, OnInit } from '@angular/core';
// model 
import { CartList } from './food-order/../../models/CartList';
// services
import { DataBindService } from './../databind.service';

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

    constructor(
        private _databindService: DataBindService
    ) { }

    ngOnInit(): void {
        this.cartList = this._databindService.getCartList();

        this.cartList.forEach(item => {

            this.subtotal = this.subtotal + (item.quantity * item.unitprice);
            
            console.log('current total: ' + this.subtotal);
        });

        // sample total fee = 5% out of total subtotal 
        this.feetotal = this.subtotal * 0.05;

        // sample grandtotal = subtotal deduct with fees
        this.grandtotal = this.subtotal - this.feetotal;
    }

}
