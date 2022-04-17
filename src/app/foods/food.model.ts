import { FoodAddress } from './foodAddress.model';

export class Food {
  public foodName: string;
  public averagePrice: number;
  public note: string;
  public addresses: FoodAddress[];
  public reviews: string[];
  public tags: string[];
  public images: string[];

  constructor(
    foodName: string,
    averagePrice: number,
    note: string,
    addresses: FoodAddress[],
    reviews: string[],
    tags: string[],
    images: string[]
  ) {
    this.foodName = foodName;
    this.averagePrice = averagePrice;
    this.note = note;
    this.addresses = addresses;
    this.reviews = reviews;
    this.tags = tags;
    this.images = images;
  }
}
