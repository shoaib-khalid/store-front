import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseLayoutComponent } from './base-layout/base-layout.component';
import { BannerComponent } from './banner/banner.component';

import { DragScrollModule } from 'ngx-drag-scroll';
import { MalihuScrollbarModule } from 'ngx-malihu-scrollbar';

@NgModule({
  declarations: [
    BaseLayoutComponent,
    BannerComponent
  ],
  imports: [
    CommonModule,
    DragScrollModule,
    MalihuScrollbarModule.forRoot(),
  ],
  exports: [
    BaseLayoutComponent,
    DragScrollModule,
    MalihuScrollbarModule
  ]
})
export class FoodOrderModule { }
