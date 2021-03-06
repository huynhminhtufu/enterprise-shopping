import { Component, OnInit } from "@angular/core";
import { Supplier } from "@models/supplier";
import { SupplierService } from "@services/supplier/supplier.service";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";

@Component({
  selector: "app-supplier",
  templateUrl: "./supplier.component.html",
  styleUrls: ["./supplier.component.scss"]
})
export class SupplierComponent implements OnInit {
  listSuppliers: Array<Supplier> = [];
  listSuppliersOrigin: Array<Supplier> = [];
  addModalVisible = false;
  addForm: FormGroup;
  updateModalVisible = false;
  updateForm: FormGroup;

  searchValue = "";
  loading = false;

  constructor(
    private supplierService: SupplierService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    // First loading
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
    }, 200);

    this.addForm = this.fb.group({
      name: ["null", [Validators.required]],
      company: ["null", [Validators.required]],
      address: ["null", [Validators.required]],
      city: ["null", [Validators.required]],
      phone: [
        "null",
        [
          Validators.required,
          Validators.pattern("^[0-9]*$"),
          Validators.minLength(8)
        ]
      ],
      fax: [
        "null",
        [
          Validators.required,
          Validators.pattern("^[0-9]*$"),
          Validators.minLength(8)
        ]
      ]
    });

    this.updateForm = this.fb.group({
      id: [null],
      name: ["null", [Validators.required]],
      company: ["null", [Validators.required]],
      address: ["null", [Validators.required]],
      city: ["null", [Validators.required]],
      phone: [
        "null",
        [
          Validators.required,
          Validators.pattern("^[0-9]*$"),
          Validators.minLength(8)
        ]
      ],
      fax: [
        "null",
        [
          Validators.required,
          Validators.pattern("^[0-9]*$"),
          Validators.minLength(8)
        ]
      ],
      valid: [null, [Validators.required]],
      modified: [null]
    });

    this.supplierService.getSuppliers().subscribe(data => {
      this.listSuppliers = this.listSuppliers.concat(data);
      this.listSuppliersOrigin = this.listSuppliersOrigin.concat(data);
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
      this.supplierService
        .createSupplier(this.addForm.value)
        .subscribe(data => {
          this.listSuppliers = this.listSuppliers.concat(data);

          this.toggleAddModal();
        });
    }
  }

  toggleUpdateModal(id?: number) {
    if (id) {
      const updatingSupplier = this.listSuppliers.find(e => e.id === id);

      this.updateForm.setValue(updatingSupplier);
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
      this.supplierService
        .updateSupplier(this.updateForm.value)
        .subscribe(data => {
          this.listSuppliers = this.listSuppliers.map(e => {
            if (e.id === data.id) {
              return data;
            } else {
              return e;
            }
          });

          this.toggleUpdateModal();
        });
    }
  }

  handleDelete(id: number) {
    this.supplierService.deleteSupplier(id).subscribe(() => {
      this.listSuppliers = this.listSuppliers.filter(e => e.id !== id);
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
    this.listSuppliers = this.listSuppliersOrigin.filter(e =>
      e.name.toLocaleLowerCase().includes(this.searchValue.toLocaleLowerCase())
    );

    this.loading = false;
    // tslint:disable-next-line: semicolon
  };
}
