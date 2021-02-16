import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseLayoutComponent } from './base-layout/base-layout.component';
import { BannerComponent } from './banner/banner.component';
import { StepperComponent } from './stepper/stepper.component';

import { DragScrollModule } from 'ngx-drag-scroll';
import { MalihuScrollbarModule } from 'ngx-malihu-scrollbar';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CatalogueComponent } from './catalogue/catalogue.component';


@NgModule({
  declarations: [
    BaseLayoutComponent,
    BannerComponent,
    StepperComponent,
    CatalogueComponent
  ],
  imports: [
    CommonModule,
    DragScrollModule,
    MalihuScrollbarModule.forRoot(),
    FontAwesomeModule
  ],
  exports: [
    BaseLayoutComponent,
    DragScrollModule,
    MalihuScrollbarModule,
    FontAwesomeModule
  ]
})
export class FoodOrderModule { }
