import { Component, OnInit } from '@angular/core';
import { Stepper } from './food-order/../../models/Stepper';

@Component({
  selector: 'food-app-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.css']
})
export class StepperComponent implements OnInit {

  stepper:Stepper[];

  constructor() { }

  ngOnInit(): void {

    this.stepper = [
      {
        id: 1,
        name: 'Order',
        status: true
      },
      {
        id: 2,
        name: 'Checkout',
        status: false
      },
      {
        id: 3,
        name: 'Done',
        status: false
      }
    ]
    
  }

}
