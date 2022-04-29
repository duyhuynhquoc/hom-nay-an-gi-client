import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FoodEditComponent } from './food-edit/food-edit.component';
import { FoodListComponent } from './food-list/food-list.component';
import { FoodsComponent } from './foods.component';

const routes: Routes = [
  {
    path: '',
    component: FoodsComponent,
    children: [
      { path: '', component: FoodListComponent, pathMatch: 'full' },
      { path: 'new', component: FoodEditComponent },
      { path: ':id/edit', component: FoodEditComponent },
    ],
  },
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FoodsRoutingModule {}
