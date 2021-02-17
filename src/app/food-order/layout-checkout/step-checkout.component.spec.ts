import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepCheckoutComponent } from './step-checkout.component';

describe('StepCheckoutComponent', () => {
  let component: StepCheckoutComponent;
  let fixture: ComponentFixture<StepCheckoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StepCheckoutComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StepCheckoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
