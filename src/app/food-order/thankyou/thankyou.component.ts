import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from './../api.service';

import Swal from 'sweetalert2'

@Component({
  selector: 'app-thankyou',
  templateUrl: './thankyou.component.html',
  styleUrls: ['./thankyou.component.css']
})
export class ThankyouComponent implements OnInit {

    payTxID:any;
    payRefID:any;
    payStatus:any;

    senderID:any;
    refID:any;
    storeID:any;
    cartID:any;

  constructor(
    private route: Router,
    private apiService: ApiService,
    private activatedRoute: ActivatedRoute
  ) {
        // get url parameter style e.g http://209.58.160.20:8090/thankyou?txid=PY160321055629630e&refId=R123123111&status=SUCCESS
        this.activatedRoute.queryParams.subscribe(params => {
        this.payTxID = params['txid'];
        this.payRefID = params['refId'];
        this.payStatus = params['status'];
        // console.log(this.payTxID + "-" + this.payRefID + "-" + this.payStatus); 
    });
  }

  ngOnInit(): void {

    localStorage.clear();
    
    this.senderID = localStorage.getItem('sender_id');
    this.refID = localStorage.getItem('ref_id');
    this.storeID = localStorage.getItem('store_id');
    this.cartID = localStorage.getItem('cart_id');

    console.log(this.senderID + " | " + this.storeID + " | " + this.cartID )

    if(this.payStatus == "SUCCESS"){
        Swal.fire({
            title: 'Sweet!',
            text: 'Your payment successfully!',
            imageUrl: './assets/image/paid.jpg',
            imageWidth: 270,
            imageHeight: 270,
            imageAlt: 'Custom image',
        })

        // localStorage.removeItem('cart_id')
        // localStorage.removeItem('anonym_cart_id')
    }else{
        Swal.fire({
            title: 'Ops!',
            text: 'Your payment failed!',
            imageUrl: './assets/image/payfail.jpg',
            imageWidth: 270,
            imageHeight: 250,
            imageAlt: 'Custom image',
        })

        // localStorage.removeItem('cart_id')
        // localStorage.removeItem('anonym_cart_id')
    }

    this.updateStatus(this.payStatus)
  }

  shopAgain(){
    this.route.navigateByUrl('/?&senderId='+this.senderID+'&storeId=a6df650a-3792-4dc8-b3de-92508357276b');
    // this.route.navigateByUrl('?storeId='+this.storeID);
  }

  updateStatus(status){
      console.log('Masok')

    let data = {
        "cartId": this.cartID,
        // "completionStatus": "",
        // "created": "2021-04-08T09:51:47.166Z",
        "customerId": this.senderID,
        // "customerNotes": "",
        // "id": "",
        "paymentStatus": status,
        // "privateAdminNotes": "",
        "storeId": this.storeID,
        // "subTotal": 0,
        // "total": 0,
        "updated": "2021-04-09T09:51:47.166Z"
      }

    this.apiService.putUpdateOrderStatus(data).subscribe((res: any) => {
        if (res.message){
            console.log('Order succesfully updated')
        }
    }, error => {
        console.log(error)
    }) 

  }

}
