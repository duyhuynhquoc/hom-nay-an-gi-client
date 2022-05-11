import { FoodAddress } from './foodAddress.model';

export class Food {
  constructor(
    public foodId: string,
    public foodName: string,
    public averagePrice: number,
    public note: string,
    public addresses: FoodAddress[],
    public reviews: string[],
    public tags: string[],
    public images: any[]
  ) {}
}
