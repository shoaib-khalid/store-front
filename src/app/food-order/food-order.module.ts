import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseLayoutComponent } from './base-layout/base-layout.component';
import { BannerComponent } from './banner/banner.component';



@NgModule({
  declarations: [
    BaseLayoutComponent,
    BannerComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    BaseLayoutComponent
  ]
})
export class FoodOrderModule { }
