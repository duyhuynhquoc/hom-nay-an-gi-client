import { COMMA, ENTER } from '@angular/cdk/keycodes';
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { Observable, Subscription } from 'rxjs';
import { BoundariesService } from 'src/app/boundaries.service';
import { map, startWith } from 'rxjs/operators';
import { FoodsService } from '../foods.service';
import { FoodAddress } from '../foodAddress.model';
import { ActivatedRoute, Router } from '@angular/router';
import { SupabaseService } from 'src/app/supabase.service';
import { Food } from '../food.model';

@Component({
  selector: 'app-food-edit',
  templateUrl: './food-edit.component.html',
  styleUrls: ['./food-edit.component.scss'],
})
export class FoodEditComponent implements OnInit, OnDestroy {
  isEditMode = false;

  /// Each position i represents for the i-th address FormGroup
  addressControls: FormControl[] = [];

  wardControls: FormControl[] = [];
  selectedWard: any[] = [];
  wards: any[] = [];
  filterWards: Observable<any[]>[] = [];

  districtControls: FormControl[] = [];
  selectedDistrict: any[] = [];
  districts: any[] = [];
  filterDistricts: Observable<any[]>[] = [];

  cityControls: FormControl[] = [];
  selectedCity: any[] = [];
  cities: any[] = [];
  filterCities: Observable<any[]>[] = [];

  reviewCtrl: FormControl = new FormControl(null);

  @ViewChild('tagInput', { static: false })
  tagInput: ElementRef<HTMLInputElement> = {} as ElementRef;
  separatorKeysCodes: number[] = [ENTER, COMMA];

  allTags: string[] = [];
  tags: string[] = [];
  tagCtrl: FormControl = new FormControl(null);
  filteredTags: Observable<string[]> = new Observable();
  ///

  foodSub = new Subscription();

  foodForm: FormGroup = new FormGroup({
    foodName: new FormControl(''),
    averagePrice: new FormControl(0),
    note: new FormControl(''),
    addresses: new FormArray([]),
    reviews: new FormArray([]),
    images: new FormArray([]),
    tags: new FormArray([]),
  });

  constructor(
    private bService: BoundariesService,
    private foodService: FoodsService,
    private supabaseService: SupabaseService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    this.bService.getCities().subscribe((data) => {
      this.cities = data;
    });

    // If it is edit mode -> Init form
    if (this.route.snapshot.routeConfig?.path === ':id/edit') {
      this.isEditMode = true;

      // Get food with id and fill the inputs
      let food = this.foodService.getFood(this.route.snapshot.params['id']);
      this.initForm(food);

      this.foodSub = this.foodService.foodsChanged.subscribe((foods) => {
        food = this.foodService.getFood(this.route.snapshot.params['id']);
        this.initForm(food);
      });
    }

    // Fetch tags from DB
    (await this.supabaseService.supabase.from('FoodTag').select('*')).data?.map(
      (tag) => this.allTags.push(tag.foodTagName)
    );

    // Update auto-complete input
    this.filteredTags = this.tagCtrl.valueChanges.pipe(
      startWith(null),
      map((fruit: string | null) =>
        fruit ? this._filter(fruit) : this.allTags.slice()
      )
    );
  }

  ngOnDestroy(): void {
    this.foodSub.unsubscribe();
  }

  addressGroupControls() {
    return (<FormArray>this.foodForm.get('addresses')).controls;
  }

  reviewControls() {
    return (<FormArray>this.foodForm.get('reviews')).controls;
  }

  private initForm(food: Food) {
    let addresses = new FormArray([]);
    food.addresses.map((a) => {
      let addressCtrl: FormControl = new FormControl(a.address);
      let wardCtrl: FormControl = new FormControl(a.ward);
      let districtCtrl: FormControl = new FormControl(a.district);
      let cityCtrl: FormControl = new FormControl(a.city);

      this.addressControls.push(addressCtrl);
      this.wardControls.push(wardCtrl);
      this.districtControls.push(districtCtrl);
      this.cityControls.push(cityCtrl);

      let currentIndex = (<FormArray>this.foodForm.get('addresses')).length;

      this.filterCities[currentIndex] = cityCtrl.valueChanges.pipe(
        startWith(a.city.name),
        map((value) => {
          return typeof value === 'string' ? value : value.name;
        }),
        map((name) => (name ? this._cityFilter(name) : this.cities.slice()))
      );

      this.bService.getDistricts(a.city.id).subscribe((districts) => {
        this.districts.push(districts);

        this.filterDistricts[currentIndex] = districtCtrl.valueChanges.pipe(
          startWith(a.district.name),
          map((value) => {
            return typeof value === 'string' ? value : value.name;
          }),
          map((name) =>
            name
              ? this._districtFilter(currentIndex, name)
              : this.districts[currentIndex].slice()
          )
        );
      });

      this.bService.getWards(a.city.id, a.district.id).subscribe((wards) => {
        this.wards.push(wards);

        this.filterWards[currentIndex] = wardCtrl.valueChanges.pipe(
          startWith(a.ward.name),
          map((value) => {
            return typeof value === 'string' ? value : value.name;
          }),
          map((name) =>
            name
              ? this._wardFilter(currentIndex, name)
              : this.wards[currentIndex].slice()
          )
        );
      });

      addresses.push(
        new FormGroup({
          address: addressCtrl,
          ward: wardCtrl,
          district: districtCtrl,
          city: cityCtrl,
        })
      );
    });

    let reviews = new FormArray([]);
    food.reviews.map((r) => {
      reviews.push(new FormControl(r));
    });

    let tags = new FormArray([]);
    food.tags.map((t) => {
      this.tags.push(t);
      tags.push(new FormControl(t));
    });

    if (food) {
      this.foodForm = new FormGroup({
        foodName: new FormControl(food.foodName),
        averagePrice: new FormControl(food.averagePrice),
        note: new FormControl(food.note),
        addresses: addresses,
        reviews: reviews,
        images: new FormArray([]),
        tags: tags,
      });
    }
  }

  onAddAddress() {
    let addressCtrl: FormControl = new FormControl('');
    let wardCtrl: FormControl = new FormControl('');
    let districtCtrl: FormControl = new FormControl('');
    let cityCtrl: FormControl = new FormControl('');

    this.addressControls.push(addressCtrl);
    this.wardControls.push(wardCtrl);
    this.districtControls.push(districtCtrl);
    this.cityControls.push(cityCtrl);

    this.filterCities[(<FormArray>this.foodForm.get('addresses')).length] =
      cityCtrl.valueChanges.pipe(
        startWith(''),
        map((value) => {
          return typeof value === 'string' ? value : value.name;
        }),
        map((name) => (name ? this._cityFilter(name) : this.cities.slice()))
      );

    this.districts.push([]);
    this.wards.push([]);

    (<FormArray>this.foodForm.get('addresses')).push(
      new FormGroup({
        address: addressCtrl,
        ward: wardCtrl,
        district: districtCtrl,
        city: cityCtrl,
      })
    );
  }

  onAddReview() {
    (<FormArray>this.foodForm.get('reviews')).push(new FormControl(''));
  }

  async onSubmit() {
    let addresses: any[] = [];
    this.foodForm.value.addresses.map((a: any) => {
      addresses.push(
        new FoodAddress(
          a.address,
          {
            id: a.ward.id,
            name: a.ward.name,
          },
          {
            id: a.district.id,
            name: a.district.name,
          },
          {
            id: a.city.id,
            code: a.city.code,
            name: a.city.name,
          }
        )
      );
    });

    const { foodName, averagePrice, note, reviews, tags, images } =
      this.foodForm.value;

    if (this.isEditMode) {
      // Edit food mode
      await this.foodService.updateFood(
        this.route.snapshot.params['id'],
        foodName,
        averagePrice,
        note,
        addresses,
        reviews,
        tags,
        images
      );
    } else {
      // Add new food mode
      await this.foodService.addFood(
        foodName,
        averagePrice,
        note,
        addresses,
        reviews,
        tags,
        images
      );
    }

    this.router.navigate(['foods']);
  }

  async onDeleteFood() {
    await this.foodService.deleteFood(this.route.snapshot.params['id']);
    this.router.navigate(['foods']);
  }

  onDeleteAddress(i: number) {
    this.addressControls.splice(i);
    this.wardControls.splice(i);
    this.districtControls.splice(i);
    this.cityControls.splice(i);
    (<FormArray>this.foodForm.get('addresses')).removeAt(i);
  }

  onDeleteReview(i: number) {
    (<FormArray>this.foodForm.get('reviews')).removeAt(i);
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our tag
    if (value) {
      this.tags.push(value);
    }

    // Clear the input value
    event.chipInput!.clear();

    // Add tag to form control
    (<FormArray>this.foodForm.get('tags')).push(new FormControl(value));

    this.tagCtrl.setValue(null);
  }

  remove(tag: string): void {
    const index = this.tags.indexOf(tag);

    if (index >= 0) {
      this.tags.splice(index, 1);
      (<FormArray>this.foodForm.get('tags')).removeAt(index);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    // Add tag to form control
    (<FormArray>this.foodForm.get('tags')).push(
      new FormControl(event.option.viewValue)
    );

    this.tags.push(event.option.viewValue);
    this.tagInput.nativeElement.value = '';
    this.tagCtrl.setValue(null);
  }

  onWardSelected(i: number, ward: any) {
    this.selectedWard = ward;
  }

  onDistrictSelected(i: number, district: any) {
    this.selectedDistrict[i] = district;

    this.filterWards[i] = new Observable();

    this.bService
      .getWards(this.selectedCity[i].id, this.selectedDistrict[i].id)
      .subscribe((data) => {
        this.wards[i] = data;

        this.filterWards[i] = this.wardControls[i].valueChanges.pipe(
          startWith(''),
          map((value) => {
            return typeof value === 'string' ? value : value.name;
          }),
          map((name) =>
            name ? this._wardFilter(i, name) : this.wards[i].slice()
          )
        );
      });
  }

  onCitySelected(i: number, city: any) {
    this.selectedCity[i] = city;

    this.filterWards[i] = new Observable();

    this.filterDistricts[i] = new Observable();

    this.bService.getDistricts(this.selectedCity[i].id).subscribe((data) => {
      this.districts[i] = data;

      this.filterDistricts[i] = this.districtControls[i].valueChanges.pipe(
        startWith(''),
        map((value) => {
          return typeof value === 'string' ? value : value.name;
        }),
        map((name) =>
          name ? this._districtFilter(i, name) : this.districts[i].slice()
        )
      );
    });
  }

  private _cityFilter(name: string) {
    const filterValue = name.toLowerCase();

    return this.cities.filter((city) =>
      city.name.toLowerCase().includes(filterValue)
    );
  }

  private _districtFilter(i: number, name: string) {
    const filterValue = name.toLowerCase();

    return this.districts[i].filter((district: any) =>
      district.name.toLowerCase().includes(filterValue)
    );
  }

  private _wardFilter(i: number, name: string) {
    const filterValue = name.toLowerCase();

    return this.wards[i].filter((ward: any) =>
      ward.name.toLowerCase().includes(filterValue)
    );
  }

  displayFn(object: any) {
    return object && object.name ? object.name : '';
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.allTags.filter((tag) =>
      tag.toLowerCase().includes(filterValue)
    );
  }
}
