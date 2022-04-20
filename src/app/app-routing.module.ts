import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FoodListComponent } from './foods/food-list/food-list.component';
import { FoodsComponent } from './foods/foods.component';
import { FoodEditComponent } from './foods/food-edit/food-edit.component';

const appRoutes: Routes = [
  { path: '', redirectTo: '/foods', pathMatch: 'full' },
  {
    path: 'foods',
    component: FoodsComponent,
    children: [
      { path: '', component: FoodListComponent, pathMatch: 'full' },
      { path: 'new', component: FoodEditComponent },
    ],
  },
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forRoot(appRoutes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
