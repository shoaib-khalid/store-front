import { Component, OnInit, Input } from '@angular/core';
import { faTrashAlt, faMinusCircle, faPlusCircle } from '@fortawesome/free-solid-svg-icons';

// model 
import { CartList } from './food-order/../../models/CartList';
// services
import { DataBindService } from './../databind.service';

import { MalihuScrollbarService } from 'ngx-malihu-scrollbar';

import { ApiService } from './../api.service';

@Component({
  selector: 'app-modal-cart',
  templateUrl: './modal-cart.component.html',
  styleUrls: ['./modal-cart.component.css']
})
export class ModalCartComponent implements OnInit {

    @Input() cartitemDetails: any;

    iconTrash = faTrashAlt;
    iconAdd = faPlusCircle;
    iconMinus = faMinusCircle;
    cartitemDetailsCount:any;
    cartID:any;

    cartList:CartList[];

    constructor(
        private _databindService: DataBindService,
        private mScrollbarService: MalihuScrollbarService,
        private apiService: ApiService
    ) { }

    ngOnInit(): void {

        this.cartID = localStorage.getItem('cart_id');
        
        this.cartList = this._databindService.getCartList();
        this.mScrollbarService.initScrollbar('#scrollable3', { axis: 'y', theme: 'dark', scrollButtons: { enable: true } });
    }

    deleteItem(id, productID){

        console.log('deleted product_id: ' + productID + "| id: " + id)

        // return false;
        console.log('cart Id delete: ' + this.cartID)

        // return false;

        let data = {
            "cartId": this.cartID,
            "id": id,
            "itemCode": productID,
            "productId": productID,
            "quantity": "1"
          }

        this.apiService.deleteCartItemID(data, id).subscribe((res: any) => {

            if (res.message){
                console.log('delete response : ', res)

                // Update item count in Cart 
                this.apiService.getCartItemByCartID(data.cartId).subscribe((res: any) => {
                    // console.log('cart item by cart ID: ', res.data.content)

                    if (res.message){
                        this.cartitemDetails = res.data.content;
                        this.cartitemDetailsCount = this.cartitemDetails.length;

                    } else {

                    }

                }, error => {
                    console.log(error)
                }) 

            } else {

            }

        }, error => {
            console.log(error)
        }) 

    }

}
