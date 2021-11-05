import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { StepCatalogueComponent } from './food-order/layout-catalogue/step-catalogue.component';
import { StepCheckoutComponent } from './food-order/layout-checkout/step-checkout.component';
import { ThankyouComponent } from './food-order/thankyou/thankyou.component';
import { ProductDetailsComponent } from './food-order/product-details/product-details.component';
import { NotFoundComponent } from './food-order/not-found/not-found.component'; 
import { LandingComponent } from './food-order/landing/landing.component';
import { RedirectionComponent } from './food-order/redirection/redirection.component';
// import { Product } from './food-order/models/Product';

const routes: Routes = [

    // { path: "", redirectTo: "catalogue", pathMatch: "full" },
    { path: "", component: LandingComponent},
    // { path: "catalogue", component: StepCatalogueComponent },
    { path: "catalogue/:catId", component: StepCatalogueComponent },
  
    // { path: "query", component: StepCatalogueComponent},
    // { path: "customers/:senderId", component: StepCatalogueComponent },
    { path: ":storeId/:senderId", component: StepCatalogueComponent },
    { path: "checkout", component: StepCheckoutComponent },
    // { path: "thankyou/:txid/:refId/:status", component: ThankyouComponent },
    { path: "thankyou", component: ThankyouComponent },
    { path: "thankyou/:status_id/:payment_type/:msg", component: ThankyouComponent },
    // http://209.58.160.20:8090/thankyou?txid=PY160321055629630e&refId=R123123111&status=SUCCESS
    // { path: "product/:category/:senderId/:storeId", component: StepCatalogueComponent },
    // { path: "products", 
    //     component: ProductDetailsComponent, 
    //     children: [
    //         { path: "name/:prodName", component: ProductDetailsComponent},
    // ]},

    { path: "products/name/:prodSeoName", component: ProductDetailsComponent },
    { path: "products/name/:prodSeoName/:storeName", component: ProductDetailsComponent },

    { path: "return", component: RedirectionComponent },
    { path: "return/:name/:email/:phone/:amount/:hash/:status_id/:order_id/:transaction_id/:msg", component: RedirectionComponent },
    // ?name=nazurl&email=naz.anip92@gmail.com&phone=0193140901&amount=24.13&hash=8b80aad7ba382c7b0debe80e72e179fde1604d132a05fd88e6ea25c9fbf7d88a&status_id=0&order_id=c542c2e8-e2c6-4d09-8ee3-0a40b5101546&transaction_id=1625799016415263855&msg=The_payment_was_declined._Please_contact_your_bank._Thank_you._

    // https://symplified.store/return?name=nazurl&email=naz.anip92@gmail.com&phone=0193140901
    // &amount=24.13&hash=8b80aad7ba382c7b0debe80e72e179fde1604d132a05fd88e6ea25c9fbf7d88a&status_id=0
    // &order_id=c542c2e8-e2c6-4d09-8ee3-0a40b5101546&transaction_id=1625799016415263855
    // &msg=The_payment_was_declined._Please_contact_your_bank._Thank_you._

    // { path: "**", redirectTo: ""}
    { path: '**', component: NotFoundComponent },
];
// http://209.58.160.20:8090/catalogue?referenceId=1234&senderId=5678&storeId=9101
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
