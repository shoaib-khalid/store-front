import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragScrollModule } from 'ngx-drag-scroll';
import { MalihuScrollbarModule } from 'ngx-malihu-scrollbar';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { StepperComponent } from './stepper/stepper.component';
import { CatalogueComponent } from './catalogue/catalogue.component';
import { BannerComponent } from './banner/banner.component';
import { StepCheckoutComponent } from './layout-checkout/step-checkout.component';
import { StepCatalogueComponent } from './layout-catalogue/step-catalogue.component';

import { DataBindService } from './databind.service';
import { ModalCheckoutComponent } from './modal-checkout/modal-checkout.component';
import { ModalProductComponent } from './modal-product/modal-product.component';


@NgModule({
  declarations: [
    BannerComponent,
    StepperComponent,
    CatalogueComponent,
    StepCheckoutComponent,
    StepCatalogueComponent,
    ModalCheckoutComponent,
    ModalProductComponent
  ],
  imports: [
    CommonModule,
    DragScrollModule,
    MalihuScrollbarModule.forRoot(),
    FontAwesomeModule
  ],
  exports: [
    StepCheckoutComponent,
    StepCatalogueComponent,
    DragScrollModule,
    MalihuScrollbarModule,
    FontAwesomeModule
  ],
  providers: [DataBindService]
})
export class FoodOrderModule { }
