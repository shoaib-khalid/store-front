import { Component, OnInit, Input } from '@angular/core';

import { faShoppingCart } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-modal-product',
  templateUrl: './modal-product.component.html',
  styleUrls: ['./modal-product.component.css']
})
export class ModalProductComponent implements OnInit {
  @Input() details: any;

  iconCart = faShoppingCart;

  constructor() {
   }

  ngOnInit(): void {

  }
  
}
