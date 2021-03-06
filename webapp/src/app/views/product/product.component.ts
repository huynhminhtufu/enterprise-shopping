import { Component, OnInit } from "@angular/core";
import { Product } from "@models/product";
import { ProductService } from "@services/product/product.service";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { NzMessageService } from "ng-zorro-antd";
import { Category } from "@models/category";
import { CategoryService } from "@services/category/category.service";
import { Supplier } from "@models/supplier";
import { SupplierService } from "@services/supplier/supplier.service";

@Component({
  selector: "app-product",
  templateUrl: "./product.component.html",
  styleUrls: ["./product.component.scss"]
})
export class ProductComponent implements OnInit {
  listProducts: Array<Product> = [];
  listProductsOrigin: Array<Product> = [];
  listCategories: Array<Category> = [];
  listSuppliers: Array<Supplier> = [];
  addModalVisible = false;
  addForm: FormGroup;
  updateModalVisible = false;
  updateForm: FormGroup;
  fakeThumb = "";

  searchValue = "";
  loading = false;
  fakeLoading = false;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private supplierService: SupplierService,
    private fb: FormBuilder,
    private message: NzMessageService
  ) {}

  ngOnInit() {
    // First loading
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
    }, 200);

    this.addForm = this.fb.group({
      name: [null, [Validators.required]],
      description: [null, [Validators.required]],
      price: [
        null,
        [Validators.required, Validators.pattern("^[0-9]*$"), Validators.min(0)]
      ],
      quantity: [
        null,
        [Validators.required, Validators.pattern("^[0-9]*$"), Validators.min(0)]
      ],
      thumbnail: [null, [Validators.required]],
      category: this.fb.group({
        id: [null, [Validators.required]]
      }),
      supplier: this.fb.group({
        id: [null, [Validators.required]]
      })
    });

    this.updateForm = this.fb.group({
      id: [null],
      name: [null, [Validators.required]],
      description: [null, [Validators.required]],
      price: [
        null,
        [Validators.required, Validators.pattern("^[0-9]*$"), Validators.min(0)]
      ],
      quantity: [
        null,
        [Validators.required, Validators.pattern("^[0-9]*$"), Validators.min(0)]
      ],
      thumbnail: [null, [Validators.required]],
      category: this.fb.group({
        id: [null, [Validators.required]],
        name: [null],
        modified: [null],
        valid: [null]
      }),
      supplier: this.fb.group({
        id: [null, [Validators.required]],
        name: [null],
        company: [null],
        address: [null],
        city: [null],
        phone: [null],
        fax: [null],
        modified: [null],
        valid: [null]
      }),
      valid: [null, [Validators.required]],
      modified: [null]
    });

    this.productService.getProducts().subscribe(data => {
      this.listProducts = this.listProducts.concat(data);
      this.listProductsOrigin = this.listProductsOrigin.concat(data);
    });

    this.categoryService.getCategories().subscribe(data => {
      this.listCategories = this.listCategories.concat(data);
    });

    this.supplierService.getSuppliers().subscribe(data => {
      this.listSuppliers = this.listSuppliers.concat(data);
    });
  }

  toggleAddModal() {
    this.addForm.reset();
    this.fakeThumb = "";

    this.addModalVisible = !this.addModalVisible;
  }

  handleAdd() {
    // tslint:disable-next-line: forin
    for (const i in this.addForm.controls) {
      this.addForm.controls[i].markAsDirty();
      this.addForm.controls[i].updateValueAndValidity();
    }

    if (this.addForm.valid) {
      this.productService.createProduct(this.addForm.value).subscribe(() => {
        // Refresh
        this.productService.getProducts().subscribe(refresh => {
          this.listProducts = [].concat(refresh);
          this.listProductsOrigin = [].concat(refresh);
        });

        this.toggleAddModal();
      });
    }
  }

  toggleUpdateModal(id?: number) {
    if (id) {
      const updatingProduct = this.listProducts.find(e => e.id === id);

      this.updateForm.setValue(updatingProduct);
    } else {
      this.updateForm.reset();
    }

    this.updateModalVisible = !this.updateModalVisible;
  }

  handleUpdate() {
    // tslint:disable-next-line: forin
    for (const i in this.updateForm.controls) {
      this.updateForm.controls[i].markAsDirty();
      this.updateForm.controls[i].updateValueAndValidity();
    }

    if (this.updateForm.valid) {
      this.productService.updateProduct(this.updateForm.value).subscribe(() => {
        // Refresh
        this.productService.getProducts().subscribe(refresh => {
          this.listProducts = [].concat(refresh);
          this.listProductsOrigin = [].concat(refresh);
        });

        this.toggleUpdateModal();
      });
    }
  }

  handleDelete(id: number) {
    this.productService.deleteProduct(id).subscribe(() => {
      this.listProducts = this.listProducts.filter(e => e.id !== id);
    });
  }

  reset(): void {
    this.searchValue = "";
    this.search();
  }

  search(): void {
    if (!this.searchValue.trim()) {
      this.searchFilter();

      return;
    }

    this.loading = true;

    setTimeout(this.searchFilter, 400);
  }

  searchFilter = () => {
    this.listProducts = this.listProductsOrigin.filter(e =>
      e.name.toLocaleLowerCase().includes(this.searchValue.toLocaleLowerCase())
    );

    this.loading = false;
    // tslint:disable-next-line: semicolon
  };

  fakeUpload(): void {
    this.fakeLoading = true;

    setTimeout(() => {
      this.addForm.controls["thumbnail"].setValue(
        "https://cdn.tgdd.vn/Products/Images/42/179673/huawei-nova-3i-trang-chipu-400x400.jpg"
      );

      this.fakeThumb =
        "https://cdn.tgdd.vn/Products/Images/42/179673/huawei-nova-3i-trang-chipu-400x400.jpg";

      this.fakeLoading = false;
    }, 2000);
  }
}
