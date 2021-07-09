import { NgModule, CUSTOM_ELEMENTS_SCHEMA  } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { DragScrollModule } from 'ngx-drag-scroll';
import { MalihuScrollbarModule } from 'ngx-malihu-scrollbar';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgxGalleryModule } from 'ngx-gallery-9';
import { NgxSpinnerModule } from "ngx-spinner";
// import 'hammerjs';
// important node: ngx-gallery-9 library
import {NumberPickerModule} from 'ng-number-picker';

import { StepperComponent } from './stepper/stepper.component';
import { CatalogueComponent } from './catalogue/catalogue.component';
import { BannerComponent } from './banner/banner.component';
import { StepCheckoutComponent } from './layout-checkout/step-checkout.component';
import { StepCatalogueComponent } from './layout-catalogue/step-catalogue.component';

import { DataBindService } from './databind.service';
import { ModalCheckoutComponent } from './modal-checkout/modal-checkout.component';
import { ModalProductComponent } from './modal-product/modal-product.component';
import { CheckoutDetailsComponent } from './checkout-details/checkout-details.component';
import { ModalCartComponent } from './modal-cart/modal-cart.component';

// HTTP Client 
import { HttpClientModule } from '@angular/common/http';
import { NgPipesModule } from 'ngx-pipes';
import { ThankyouComponent } from './thankyou/thankyou.component';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { LandingComponent } from './landing/landing.component';
import { RedirectionComponent } from './redirection/redirection.component';


@NgModule({
  declarations: [
    BannerComponent,
    StepperComponent,
    CatalogueComponent,
    StepCheckoutComponent,
    StepCatalogueComponent,
    ModalCheckoutComponent,
    ModalProductComponent,
    CheckoutDetailsComponent,
    ModalCartComponent,
    ThankyouComponent,
    ProductDetailsComponent,
    NotFoundComponent,
    LandingComponent,
    RedirectionComponent
  ],
  imports: [
    CommonModule,
    DragScrollModule,
    MalihuScrollbarModule.forRoot(),
    FontAwesomeModule,
    NgxGalleryModule,
    NumberPickerModule,
    HttpClientModule,
    NgPipesModule,
    FormsModule,
    NgxSpinnerModule
  ],
  exports: [
    StepCheckoutComponent,
    StepCatalogueComponent,
    DragScrollModule,
    MalihuScrollbarModule,
    FontAwesomeModule,
    NgxGalleryModule,
    NumberPickerModule,
    HttpClientModule,
    NgPipesModule,
    FormsModule,
    NgxSpinnerModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
      DataBindService,
      DatePipe
    ]
})
export class FoodOrderModule { }
