import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { RouterModule } from '@angular/router';
import { AngularMaterialModule } from '../angular-material.module';
import { PrimeNgModule } from '../primeng.module';
import { FoodEditComponent } from './food-edit/food-edit.component';
import { FoodItemComponent } from './food-item/food-item.component';
import { FoodListComponent } from './food-list/food-list.component';
import { FoodsRoutingModule } from './foods-routing.module';
import { FoodsComponent } from './foods.component';

@NgModule({
  declarations: [
    FoodsComponent,
    FoodEditComponent,
    FoodListComponent,
    FoodItemComponent,
  ],
  imports: [
    CommonModule,
    PrimeNgModule,
    AngularMaterialModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    FoodsRoutingModule,
  ],
  exports: [],
})
export class FoodsModule {}
