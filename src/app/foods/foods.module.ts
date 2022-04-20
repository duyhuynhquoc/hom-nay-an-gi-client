import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Routes } from '@angular/router';
import { FoodListComponent } from './food-list/food-list.component';
import { FoodsComponent } from './foods.component';

const appRoutes: Routes = [{ path: '', component: FoodListComponent }];

@NgModule({
  imports: [CommonModule],
  declarations: [
    FoodsComponent
  ],
})
export class FoodsRoutingModule {}
