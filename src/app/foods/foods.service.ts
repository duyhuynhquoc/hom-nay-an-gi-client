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
      this.foodsChanged.next(this.getFoods());
      return;
    }

    const { data } = await this.supabaseService.supabase
      .from('User_Food')
      .select(
        `
          created_at,
          food:Food(
            *,
            addresses:FoodAddress(address, ward, district, city),
            reviews:FoodReview(url),
            tags:FoodTag(foodTagName),
            images:FoodImage(url)
          )
        `
      )
      .filter('userId', 'eq', userId)
      .order('created_at', { ascending: false });

    if (data) {
      for (let item of data) {
        const addresses = item.food.addresses.map(
          (a: any) => new FoodAddress(a.address, a.ward, a.district, a.city)
        );

        const reviews = item.food.reviews.map((r: any) => r.url);

        const tags = item.food.tags.map((t: any) => t.foodTagName);

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
    }

    this.foodsChanged.next(this.getFoods());
  }

  getFoods() {
    return this.foods.slice();
  }

  getFood(id: string) {
    let result = new Food('', '', 0, '', [], [], [], []);

    this.getFoods().map((f) => {
      if (f.foodId == id) {
        result = f;
      }
    });

    return result;
  }

  clearFoods() {
    this.foods = [];
    this.foodsChanged.next(this.getFoods());
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
          ward: a.ward,
          district: a.district,
          city: a.city,
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

      this.foods.unshift(
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

  async updateFood(
    foodId: string,
    foodName: any,
    averagePrice: any,
    note: any,
    addresses: FoodAddress[],
    reviews: any[],
    tags: any[],
    images: any[]
  ) {
    await this.supabaseService.supabase
      .from('FoodAddress')
      .delete()
      .match({ foodId: foodId });
    await this.supabaseService.supabase
      .from('FoodReview')
      .delete()
      .match({ foodId: foodId });
    await this.supabaseService.supabase
      .from('FoodTag')
      .delete()
      .match({ foodId: foodId });
    await this.supabaseService.supabase
      .from('FoodImage')
      .delete()
      .match({ foodId: foodId });

    await this.supabaseService.supabase
      .from('Food')
      .update({ foodName, averagePrice, note })
      .eq('foodId', foodId);

    await this.supabaseService.supabase.from('FoodAddress').insert(
      addresses.map((a: any) => ({
        address: a.address,
        ward: a.ward,
        district: a.district,
        city: a.city,
        foodId,
      }))
    );

    await this.supabaseService.supabase.from('FoodReview').insert(
      reviews.map((r: any) => ({
        url: r,
        foodId,
      }))
    );

    await this.supabaseService.supabase.from('FoodTag').insert(
      tags.map((t: any) => ({
        foodTagName: t,
        foodId,
      }))
    );

    await this.supabaseService.supabase.from('FoodImage').insert(
      images.map((i: any) => ({
        url: i,
        foodId,
      }))
    );

    this.foods = this.foods.map((f) => {
      if (f.foodId == foodId) {
        f = new Food(
          foodId,
          foodName,
          averagePrice,
          note,
          addresses,
          reviews,
          tags,
          images
        );
      }
      return f;
    });
    this.foodsChanged.next(this.getFoods());
  }

  async deleteFood(foodId: string) {
    await this.supabaseService.supabase
      .from('FoodAddress')
      .delete()
      .match({ foodId: foodId });
    await this.supabaseService.supabase
      .from('FoodReview')
      .delete()
      .match({ foodId: foodId });
    await this.supabaseService.supabase
      .from('FoodTag')
      .delete()
      .match({ foodId: foodId });
    await this.supabaseService.supabase
      .from('FoodImage')
      .delete()
      .match({ foodId: foodId });
    await this.supabaseService.supabase
      .from('User_Food')
      .delete()
      .match({ foodId: foodId });
    await this.supabaseService.supabase
      .from('Food')
      .delete()
      .match({ foodId: foodId });

    this.foods = this.foods.filter((f) => f.foodId !== foodId);
    this.foodsChanged.next(this.getFoods());
  }
}
