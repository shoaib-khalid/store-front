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

    assets = {};
    logoExist: boolean = false;
    status_id: any;
    msg: any;
    successPay: boolean = false;
    failed_msg: string = "";

  constructor(
    private route: Router,
    private apiService: ApiService,
    private activatedRoute: ActivatedRoute
  ) {
        // get url parameter style e.g http://209.58.160.20:8090/thankyou?txid=PY160321055629630e&refId=R123123111&status=SUCCESS
        this.activatedRoute.params.subscribe(params => {
        this.status_id = params['status_id']
        this.msg = params['msg']
        // this.payStatus = params['status'];
        // console.log(this.payTxID + "-" + this.payRefID + "-" + this.payStatus); 
        });

        // alert(this.status_id + " | " + this.msg)

        if(this.status_id == "SUCCESS"){

            this.successPay = true
            // alert('here')
        }
        
        if(this.status_id == "FAILED"){

            const msgraw = this.msg
            this.failed_msg = msgraw.replace(/_/g, " ");
    
            // alert(this.failed_msg)
            
        }

        
        
  }

  async ngOnInit(): Promise<void> {

    var temp_storeID = localStorage.getItem('store_id'); // this temp_storeID will be cleared after second referesh

    // localStorage.clear();
    
    this.senderID = localStorage.getItem('sender_id');
    this.refID = localStorage.getItem('ref_id');
    this.storeID = localStorage.getItem('store_id');
    this.cartID = localStorage.getItem('cart_id');

    // call asset api to get logo
    const assetData = await this.getAssets(temp_storeID)
    console.log("asset Data...", assetData)
    this.assets = assetData
    // this.cartID = created_cart['id'];

    if(this.assets != null){
        this.logoExist = true;
    }

    console.log(this.senderID + " | " + this.storeID + " | " + this.cartID )

    // remove update order status , it will be done by backend 
    // this.updateStatus(this.payStatus)
  }

  shopAgain(){

    this.route.navigateByUrl('/');

    // this.route.navigateByUrl('/?&senderId='+this.senderID+'&storeId=a6df650a-3792-4dc8-b3de-92508357276b');
    // this.route.navigateByUrl('?storeId='+this.storeID);
  }

  backToCheckout(){
    this.route.navigateByUrl('/checkout')
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

  getAssets(storeID){
    console.log("storeID: "+storeID);
    return new Promise(resolve => {
        // check count Item in Cart 
        this.apiService.getStoreAssets(storeID).subscribe((res: any) => {
            
            resolve(res.data)

        }, error => {
            // Swals.fire("Oops...", "Error : <small style='color: red; font-style: italic;'>" + error.error.message + "</small>", "error")
        }) 
        
    });

  }

}
