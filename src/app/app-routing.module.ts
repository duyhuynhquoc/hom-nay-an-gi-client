import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SignupComponent } from './auth/signup/signup.component';

const appRoutes: Routes = [
  { path: '', redirectTo: '/foods', pathMatch: 'full' },
  {
    path: 'foods',
    loadChildren: () =>
      import('./foods/foods.module').then((m) => m.FoodsModule),
  },
  { path: 'signup', component: SignupComponent },
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forRoot(appRoutes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
