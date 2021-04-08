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
import { totalmem } from 'os';
import Swal from 'sweetalert2'
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-checkout-details',
  templateUrl: './checkout-details.component.html',
  styleUrls: ['./checkout-details.component.css']
})
export class CheckoutDetailsComponent implements OnInit, AfterViewInit, OnDestroy {

    cartList:CartList[];
    trxid: any;

    iconMoney = faMoneyBillAlt;

    senderID:any;
    refID:any;
    storeID:any;

    cartExist:boolean = false;
    cartCount:number;
    cart:any;
    cartitemDetails:any;
    cartitemDetailsCount:number;
    cartItemCount:number;
    cartID:any;
    product:any;
    allProductInventory = [];
    orderId:any;

    totalPrice:number = 0;
    subTotal:number = 0;
    deliveryFee:number = 0;

    userPostcode:any;
    userName:any;
    userEmail:any;
    userMsisdn:any;
    userAddress:any;
    userCities:any;
    userState:any;
    userCountries:any;

    constructor(
        private _databindService: DataBindService,
        private mScrollbarService: MalihuScrollbarService,
        private route: Router,
        private apiService: ApiService,
        private datePipe: DatePipe
    ) { }

    ngOnInit(): void {
        console.log('ngOnInit');

        this.senderID = localStorage.getItem('sender_id');
        this.refID = localStorage.getItem('ref_id');
        this.storeID = localStorage.getItem('store_id');
        this.cartID = localStorage.getItem('cart_id');
        // this.orderID = localStorage.getItem('order_id')

        // console.log(this.refID + "-" + this.senderID + "-" + this.storeID);

        // dummy total, if u delete this view will crash and checkCart() will not be called, later to enhance
        // this.cartList = this._databindService.getCartList();

        this.getProduct();
        
        this.checkCart();
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

    initOrder(){
        let data = {
            "cartId": this.cartID,
            "completionStatus": "",
            "created": "",
            "customerId": this.senderID,
            "customerNotes": "",
            "id": "",
            "paymentStatus": "pending",
            "privateAdminNotes": "",
            "storeId": this.storeID,
            "subTotal": 0,
            "total": this.totalPrice,
            "updated": ""
        }
        
        let initOrder = this.apiService.postInitOrder(data)
        let getOrderId = this.apiService.getOrderId(this.senderID, this.storeID)

        forkJoin([initOrder, getOrderId]).subscribe(results => {

        let objGet = results[1]

        // always get latest order id 
        this.orderId = objGet['data'].content[0].id

        // console.log('result 1: ', objPost)
        console.log('orderID: ', this.orderId)

        }, error =>{
            Swal.fire("Oops...", "Error : <small style='color: red; font-style: italic;'>" + error.error.message + "</small>", "error")
        });
    }


    getProduct(){
        this.apiService.getProductSByStoreID(this.storeID).subscribe((res: any) => {
            // console.log('raw resp:', res)
            if (res.message) {
                this.product = res.data.content;
                console.log('getProduct(): ', this.product);
                // console.log('price: ', this.product[0].productInventories[1]);

                // return false;

                let productObj = this.product;

                productObj.forEach( obj => {
                    // console.log(obj);
                    // let productID = obj.id;
                    let inventoryArr = obj.productInventories;

                    if(inventoryArr.length !== 0){

                        inventoryArr.forEach( inventoryObj => {
                            // creating a collection of productInventories array to prepare base mapping 
                            // for logic that related to itemCode
                            this.allProductInventory.push(inventoryObj);
                        });
                    }
                });
                
                console.log('all product inventories: ', this.allProductInventory)

                //get the price
                this.countPrice(this.allProductInventory);

            } else {
                // condition if required for different type of response message 
            }
        }, error => {
            console.log(error)
        }) 
    }


    checkCart(){
        // check count Item in Cart 
        this.apiService.getCartItemByCartID(this.cartID).subscribe((res: any) => {
            console.log('cart item by cart ID: ', res.data.content)

            if (res.message){
                this.cartitemDetails = res.data.content;
                this.cartitemDetailsCount = this.cartitemDetails.length;

            } else {
            }
        }, error => {
            console.log(error)
        }) 
    }

    countPrice(productList:any){

        this.subTotal = 0

        this.cartitemDetails.forEach(cartItem => {

            productList.map(allProduct => {
                if(allProduct.itemCode == cartItem.itemCode){
                    this.subTotal = this.subTotal + (allProduct.price * cartItem.quantity)
                }
            })
        });

        this.totalPrice = this.subTotal + this.deliveryFee
    }

    goSkip(e){
        this.route.navigate(['thankyou']);   
    }

    goPay(){
        let dateTime = new Date()

        this.trxid = this.datePipe.transform(dateTime, "yyyyMMddhhmmss")

        let data = {
            "customerId": this.senderID,
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
            Swal.fire("Payment failed!", "Error : <small style='color: red; font-style: italic;'>" + error.error.message + "</small>", "error")
        }) 
    }

    checkOut(){
        // alert('postcode: ' + 
        // this.userPostcode + this.userName + this.userEmail + 
        // this.userMsisdn + this.userAddress + this.userState + 
        // this.userCountries)

        let data = {
            "merchantId":1,
            "customerId": 1,
            "productCode": "document",
            "itemType": "parcel",
            "deliveryProviderId":1,
            "totalWeightKg":1,
            "shipmentContent":"Flyers Supllies",
            "pieces": 2,
            "IsInsurance": false,
            "shipmentValue":1,
            
            "delivery" : {
                "deliveryPostcode": this.userPostcode,
                "deliveryAddress": this.userAddress,
                "deliveryCity": this.userCities,
                "deliveryContactEmail": this.userEmail,
                "deliveryContactName": this.userName,
                "deliveryContactPhone": this.userMsisdn,
                "deliveryCountry": this.userCountries,
                "deliveryState": this.userState 
            },
            
            "pickup" : {
                "pickupOption":"ADDHOC",
                "vehicleType":"MOTORCYCLE",
                "isTrolleyRequired":false,
                "pickupRemarks":"",
                "pickupContactName": "SK",
                "pickupContactPhone": "0123327339",
                "pickupContactEmail": "taufik@kalsym.com",
                "pickupAddress": "Unit S-14-09,Level 12B, First Subang,Jalan SS15/4G,47500 Subang Jaya, Selangor",  
                "pickupPostcode":"47500",
                "pickupCity":"Subang Jaya",
                "pickupState":"Selangor",
                "pickupCountry":"MYS",
                "pickupLocationId":34176
            }
          }

        this.submitOrder(data);
    }

    submitOrder(data:any){

        this.apiService.postSubmitDeliveryOrder(data).subscribe((res: any) => {
            if (res.message) {

                console.log('submit order response: ' , res)

                this.goPay()

            }
        }, error => {
            Swal.fire("Submit order failed!", "Error : <small style='color: red; font-style: italic;'>" + error.error.message + "</small>", "error")
        }) 

    }

    getDeliveryFee(){

        // alert('postcode: ' + 
        // this.userPostcode + this.userName + this.userEmail + 
        // this.userMsisdn + this.userAddress + this.userState + 
        // this.userCountries)

        // return false;
        let data = {

                "merchantId": 1,
                "customerId": this.senderID,
                "productCode": "parcel",
                "itemType": "parcel",
                "totalWeightKg": 1,
                
                "delivery" : {
                    "deliveryPostcode": this.userPostcode,
                    "deliveryAddress": "No 20, Jalan Temasik, Tamago Island, 40150, Nippon",
                    // "deliveryCity": "Tamago Island",
                    // "deliveryContactEmail": "nazrul@kalsym.com",
                    // "deliveryContactName": "nazrul",
                    // "deliveryContactPhone": "0142217851",
                    // "deliveryCountry": "Nippon",
                    // "deliveryState": "Selangor" 
                },
                
                "pickup" : {
                    "pickupOption":"SHCEDULE",
                    "vehicleType":"MOTORCYCLE",
                    "pickupPostcode":"47500"	  
                }
            }        

        this.apiService.postTogetDeliveryFee(data).subscribe((res: any) => {
            if (res.message) {

                this.deliveryFee = res.data[0].price;

                // alert('delivery charge: '+this.deliveryFee)

                this.totalPrice = this.subTotal + this.deliveryFee

                Swal.fire("Delivery Fees", "Additional charges RM " + this.deliveryFee, "info")
            }
        }, error => {
            Swal.fire("Oops...", "Error : <small style='color: red; font-style: italic;'>" + error.error.message + "</small>", "error")
        }) 

    }

}
