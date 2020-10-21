import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AccountService } from '../../services/account.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  // tslint:disable-next-line: no-output-on-prefix
  @Output() onCancel = new EventEmitter();
  registerForm: FormGroup;
  maxDate: Date;
  validationErrors: string[] = [];

  constructor(private accountService: AccountService, private toastr: ToastrService, private fb: FormBuilder, private router: Router) { }

  ngOnInit(): void {
    this.initializeForm();
    this.maxDate = new Date();
    this.maxDate.setFullYear(this.maxDate.getFullYear() - 18);
  }

  initializeForm() {
    //no es optimo, mejor como lo hace fernando herrera
    this.registerForm = this.fb.group(
      {
        gender: ['male'],
        username: ['', [Validators.required]],
        knownAs: ['', [Validators.required]],
        dateOfBirth: ['', [Validators.required]],
        city: ['', [Validators.required]],
        country: ['', [Validators.required]],
        password: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(10)]],
        confirmPassword: ['', [Validators.required, this.matchValues('password')]]
      }
    );

    // new this.fb.group({

    // });
  }

  isInValidControl(name: string){
    return this.registerForm.get(name).errors && this.registerForm.get(name).touched;
  }

  matchValues(matchTo: string): ValidatorFn{
    console.log('paso');
    return (control: AbstractControl) => {
      return control?.value === control?.parent?.controls[matchTo].value
        ? null : {isMatching: true};
    }
  }

  register() {
    this.registerForm.markAllAsTouched();
    if (!this.registerForm.valid){ return; }
    this.accountService.register(this.registerForm.value)
      .subscribe(resp => {
        this.router.navigate(['/members']);
        this.cancel();
      }, error => {
        this.validationErrors = error;
      });
  }

  cancel() {
    this.onCancel.emit();
  }

}
