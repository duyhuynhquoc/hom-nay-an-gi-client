import { Injectable, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { SupabaseService } from '../supabase.service';
import { Food } from './food.model';
import { FoodAddress } from './foodAddress.model';

@Injectable({
  providedIn: 'root',
})
export class FoodsService {
  foodsChanged = new Subject<Food[]>();

  private foods: Food[] = [];

  constructor(private supabaseService: SupabaseService) {}

  async fetchFoods() {
    const foods = (
      await this.supabaseService.supabase.from('Food').select(
        `
          *,
          addresses:FoodAddress(address, ward, district, city),
          reviews:FoodReview(url),
          tags:FoodTag(foodTagName),
          images:FoodImage(url)
        `
      )
    ).data;

    if (foods) {
      for (let f of foods) {
        const addresses = f.addresses.map(
          (a: any) => new FoodAddress(a.address, a.ward, a.district, a.city)
        );

        const reviews = f.reviews.map((r: any) => r.url);

        const tags = f.tags.map((t: any) => t.tagName);

        const images = f.images.map((i: any) => i.url);

        this.foods.push(
          new Food(
            f.foodId,
            f.foodName,
            f.averagePrice,
            f.note,
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

    console.log(data);
    this.foodsChanged.next(this.getFoods());
  }
}
