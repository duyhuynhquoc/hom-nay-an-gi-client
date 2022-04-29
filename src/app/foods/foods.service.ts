import { Injectable, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { SupabaseService } from '../supabase.service';
import { Food } from './food.model';
import { FoodAddress } from './foodAddress.model';

@Injectable({
  providedIn: 'root',
})
export class FoodsService {
  foodsChanged = new Subject<Food[]>();

  private foods: Food[] = [];

  constructor(
    private supabaseService: SupabaseService,
    private authService: AuthService
  ) {}

  async fetchFoods(userId: string) {
    this.foods = [];

    if (userId == '') {
      this.foodsChanged.next(this.foods);
      return;
    }

    const { data } = await this.supabaseService.supabase
      .from('User_Food')
      .select(
        `
          food:Food(
            *,
            addresses:FoodAddress(address, ward, district, city),
            reviews:FoodReview(url),
            tags:FoodTag(foodTagName),
            images:FoodImage(url)
          )
        `
      )
      .filter('userId', 'eq', userId);

    if (data) {
      for (let item of data) {
        const addresses = item.food.addresses.map(
          (a: any) => new FoodAddress(a.address, a.ward, a.district, a.city)
        );

        const reviews = item.food.reviews.map((r: any) => r.url);

        const tags = item.food.tags.map((t: any) => t.tagName);

        const images = item.food.images.map((i: any) => i.url);

        this.foods.push(
          new Food(
            item.food.foodId,
            item.food.foodName,
            item.food.averagePrice,
            item.food.note,
            addresses ? addresses : [],
            reviews ? reviews : [],
            tags ? tags : [],
            images ? images : []
          )
        );
      }

      this.foodsChanged.next(this.foods);
    }
  }

  getFoods() {
    return this.foods.slice();
  }

  clearFoods() {
    this.foods = [];
    this.foodsChanged.next(this.foods);
  }

  async addFood(
    foodName: any,
    averagePrice: any,
    note: any,
    addresses: FoodAddress[],
    reviews: any[],
    tags: any[],
    images: any[]
  ) {
    const { data, error } = await this.supabaseService.supabase
      .from('Food')
      .insert([{ foodName: foodName, averagePrice: averagePrice, note: note }]);

    if (data && data[0].foodId) {
      await this.supabaseService.supabase.from('FoodAddress').insert(
        addresses.map((a: any) => ({
          address: a.address,
          ward: a.ward.name,
          district: a.district.name,
          city: a.city.name,
          foodId: data[0].foodId,
        }))
      );

      await this.supabaseService.supabase.from('FoodReview').insert(
        reviews.map((r: any) => ({
          url: r,
          foodId: data[0].foodId,
        }))
      );

      await this.supabaseService.supabase.from('FoodTag').insert(
        tags.map((t: any) => ({
          foodTagName: t,
          foodId: data[0].foodId,
        }))
      );

      await this.supabaseService.supabase.from('FoodImage').insert(
        images.map((i: any) => ({
          url: i,
          foodId: data[0].foodId,
        }))
      );

      await this.supabaseService.supabase.from('User_Food').insert({
        userId: this.authService.getUserId(),
        foodId: data[0].foodId,
      });

      this.foods.push(
        new Food(
          data[0].foodId,
          foodName,
          averagePrice,
          note,
          addresses,
          reviews,
          tags,
          images
        )
      );
    }

    this.foodsChanged.next(this.getFoods());
  }
}
