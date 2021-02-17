import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-modal-product',
  templateUrl: './modal-product.component.html',
  styleUrls: ['./modal-product.component.css']
})
export class ModalProductComponent implements OnInit {
  @Input() details: any;

  constructor() { }

  ngOnInit(): void {

  }
  
}
