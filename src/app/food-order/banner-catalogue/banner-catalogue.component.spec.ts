import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BannerCatalogueComponent } from './banner-catalogue.component';

describe('BannerCatalogueComponent', () => {
  let component: BannerCatalogueComponent;
  let fixture: ComponentFixture<BannerCatalogueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BannerCatalogueComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BannerCatalogueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
