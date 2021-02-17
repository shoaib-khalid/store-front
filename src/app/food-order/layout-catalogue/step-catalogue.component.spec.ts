import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepCatalogueComponent } from './step-catalogue.component';

describe('StepCatalogueComponent', () => {
  let component: StepCatalogueComponent;
  let fixture: ComponentFixture<StepCatalogueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StepCatalogueComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StepCatalogueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
