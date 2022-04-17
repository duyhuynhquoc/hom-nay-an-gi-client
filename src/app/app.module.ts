import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { FoodEditComponent } from './foods/food-edit/food-edit.component';
import { FoodListComponent } from './foods/food-list/food-list.component';
import { FoodItemComponent } from './foods/food-item/food-item.component';
import { PrimeNgModule } from './primeng.module';

@NgModule({
  declarations: [
    AppComponent,
    FoodEditComponent,
    FoodListComponent,
    FoodItemComponent,
  ],
  imports: [BrowserModule, PrimeNgModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
