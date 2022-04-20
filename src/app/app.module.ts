import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { FoodEditComponent } from './foods/food-edit/food-edit.component';
import { FoodListComponent } from './foods/food-list/food-list.component';
import { FoodItemComponent } from './foods/food-item/food-item.component';
import { PrimeNgModule } from './primeng.module';
import { AppRoutingModule } from './app-routing.module';
import { FoodsComponent } from './foods/foods.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  BrowserAnimationsModule,
  NoopAnimationsModule,
} from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { AngularMaterialModule } from './angular-material.module';

@NgModule({
  declarations: [
    AppComponent,
    FoodsComponent,
    FoodEditComponent,
    FoodListComponent,
    FoodItemComponent,
  ],
  imports: [
    PrimeNgModule,
    AngularMaterialModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    BrowserAnimationsModule,
    NoopAnimationsModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
