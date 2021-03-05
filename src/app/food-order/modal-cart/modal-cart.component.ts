import { Component, OnInit } from '@angular/core';
import { faTrashAlt, faMinusCircle, faPlusCircle } from '@fortawesome/free-solid-svg-icons';

// model 
import { CartList } from './food-order/../../models/CartList';
// services
import { DataBindService } from './../databind.service';

import { MalihuScrollbarService } from 'ngx-malihu-scrollbar';

@Component({
  selector: 'app-modal-cart',
  templateUrl: './modal-cart.component.html',
  styleUrls: ['./modal-cart.component.css']
})
export class ModalCartComponent implements OnInit {

    iconTrash = faTrashAlt;
    iconAdd = faPlusCircle;
    iconMinus = faMinusCircle;

    cartList:CartList[];

    constructor(
        private _databindService: DataBindService,
        private mScrollbarService: MalihuScrollbarService
    ) { }

    ngOnInit(): void {
        this.cartList = this._databindService.getCartList();
        this.mScrollbarService.initScrollbar('#scrollable3', { axis: 'y', theme: 'dark', scrollButtons: { enable: true } });
    }

}
