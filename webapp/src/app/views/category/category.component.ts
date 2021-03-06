import { Component, OnInit } from "@angular/core";
import { Category } from "@models/category";
import { CategoryService } from "@services/category/category.service";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";

@Component({
  selector: "app-category",
  templateUrl: "./category.component.html",
  styleUrls: ["./category.component.scss"]
})
export class CategoryComponent implements OnInit {
  listCategories: Array<Category> = [];
  listCategoriesOrigin: Array<Category> = [];
  addModalVisible = false;
  addForm: FormGroup;
  updateModalVisible = false;
  updateForm: FormGroup;

  searchValue = "";
  loading = false;

  constructor(
    private categoryService: CategoryService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    // First loading
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
    }, 200);

    this.addForm = this.fb.group({
      name: ["null", [Validators.required]]
    });

    this.updateForm = this.fb.group({
      id: [null],
      name: [null, [Validators.required]],
      valid: [null, [Validators.required]],
      modified: [null]
    });

    this.categoryService.getCategories().subscribe(data => {
      this.listCategories = this.listCategories.concat(data);
      this.listCategoriesOrigin = this.listCategoriesOrigin.concat(data);
    });
  }

  toggleAddModal() {
    this.addForm.reset();

    this.addModalVisible = !this.addModalVisible;
  }

  handleAdd() {
    // tslint:disable-next-line: forin
    for (const i in this.addForm.controls) {
      this.addForm.controls[i].markAsDirty();
      this.addForm.controls[i].updateValueAndValidity();
    }

    if (this.addForm.valid) {
      this.categoryService
        .createCategory(this.addForm.value)
        .subscribe(data => {
          this.listCategories = this.listCategories.concat(data);
          this.categoryService.setListCategories(this.listCategories);

          this.toggleAddModal();
        });
    }
  }

  toggleUpdateModal(id?: number) {
    if (id) {
      const updatingCategory = this.listCategories.find(e => e.id === id);

      this.updateForm.setValue(updatingCategory);
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
      this.categoryService
        .updateCategory(this.updateForm.value)
        .subscribe(data => {
          this.listCategories = this.listCategories.map(e => {
            if (e.id === data.id) {
              return data;
            } else {
              return e;
            }
          });

          this.categoryService.setListCategories(this.listCategories);

          this.toggleUpdateModal();
        });
    }
  }

  handleDelete(id: number) {
    this.categoryService.deleteCategory(id).subscribe(() => {
      this.listCategories = this.listCategories.filter(e => e.id !== id);

      this.categoryService.setListCategories(this.listCategories);
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
    this.listCategories = this.listCategoriesOrigin.filter(e =>
      e.name.toLocaleLowerCase().includes(this.searchValue.toLocaleLowerCase())
    );

    this.loading = false;
    // tslint:disable-next-line: semicolon
  };
}
