import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { StepCatalogueComponent } from './food-order/layout-catalogue/step-catalogue.component'
import { StepCheckoutComponent } from './food-order/layout-checkout/step-checkout.component'

const routes: Routes = [

    { path: "", redirectTo: "/catalogue", pathMatch: "full" },
    { path: "catalogue", component: StepCatalogueComponent },
    { path: "catalogue/:store_id", component: StepCatalogueComponent },
    { path: "checkout", component: StepCheckoutComponent },

    { path: "**", redirectTo: "/catalogue" }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
