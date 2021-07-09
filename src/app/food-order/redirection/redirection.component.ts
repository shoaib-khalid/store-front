import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap  } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-redirection',
  templateUrl: './redirection.component.html',
  styleUrls: ['./redirection.component.css']
})
export class RedirectionComponent implements OnInit {

    refID: string;
    storeID: string;
    senderID: string;
    cartID: string;
    name: any;
    email: any;
    phone: any;
    amount: any;
    hash: any;
    status_id: any;
    order_id: any;
    transaction_id: any;
    msg: any;
    subDomain: string;

  constructor(
    private route: Router,
    private activatedRoute: ActivatedRoute,
  ) {

    // { path: "return/:name/:email/:phone/:amount/:hash/:status_id/:order_id/:transaction_id/:msg", component: RedirectionComponent },

    // get url parameter style e.g http://localhost:4200/catalogue?store_id=3
    this.activatedRoute.queryParams.subscribe(params => {
    
        this.name = params['name']
        this.email = params['email']
        this.phone = params['phone']
        this.amount = params['amount']
        this.hash = params['hash']
        this.status_id = params['status_id']
        this.order_id = params['order_id']
        this.transaction_id = params['transaction_id']
        this.msg = params['msg']
  
    });

    // alert(this.msg)

   }

  ngOnInit(): void {

        // this.test$ = this.activatedRoute.queryParamMap.pipe(
        //     map((params: ParamMap) => params.get('test')),
        // );
    
        // subscribe and log the params when they change
        // you could set to an internal variable or
        // bind the filter$ directly to the async pipe
        // ultimatecourses.com/blog/angular-ngfor-async-pipe
        // this.test$.subscribe(param => alert(param));

        this.senderID = localStorage.getItem('sender_id');
        this.refID = localStorage.getItem('ref_id');
        this.storeID = localStorage.getItem('store_id');
        // this.storeDeliveryPercentage = localStorage.getItem('store_delivery_percentage');

        // console.log('storeDeliveryPercentage: ', typeof(this.storeDeliveryPercentage))

        if(this.senderID === 'undefined'){
            this.cartID = localStorage.getItem("anonym_cart_id")
            console.log('cart id anonymous session: ' + this.cartID)
        }else{
            this.cartID = localStorage.getItem('cart_id');
            console.log('cart id session: ' + this.cartID)
        }

        this.subDomain = localStorage.getItem('subdomain')

        if(this.status_id == "1" || this.status_id == 1){
            this.status_id = "SUCCESS"
        }else{
            this.status_id = "FAILED"
        }


        const url = "https://" + this.subDomain + ".simplified.store/thankyou/"+this.status_id+"/"+this.msg
        const testurl = "http://" + this.subDomain + ".test:4200/thankyou/"+this.status_id+"/"+this.msg

        // alert(url)

        window.location.href = testurl;

        // this.route.navigate(['thankyou/'+prodName]);

        // alert("senderID: " + this.senderID + " refID: " + this.refID + " storeID: " + this.storeID + " cartID: " + this.cartID)
  }

}
