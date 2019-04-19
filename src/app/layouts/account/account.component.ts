import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, NgForm, Validators } from '@angular/forms';
import { ProfileService } from '../../shared/profile.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {
  @ViewChild('myForm') myForm: NgForm;
  unamePattern = '^[a-zA-Z0-9_-]{8,15}$';
  pwdPattern = '^.*(?=.{8,})((?=.*[!@#$%^&*()\\-_=+{};:,<.>]){1})(?=.*\\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$';
  emailPattern = '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$';

  isValidFormSubmitted = null;

  profileForm = this.formBuilder.group({
    username: ['', [Validators.required, Validators.pattern(this.unamePattern)]],
    password: ['', [Validators.required, Validators.pattern(this.pwdPattern)]],
    email: ['', [Validators.required, Validators.pattern(this.emailPattern)]],
    subscribe: [false],
  });

  constructor(private formBuilder: FormBuilder, private profileService: ProfileService) {
  }

  onFormSubmit() {
    this.isValidFormSubmitted = false;
    if (this.profileForm.invalid) {
      return;
    }
    this.isValidFormSubmitted = true;
    const user: any = this.profileForm.value;
    this.profileService.createUser(user);
    this.profileForm.reset();
    this.myForm.resetForm();
  }

  get username() {
    return this.profileForm.get('username');
  }

  get password() {
    return this.profileForm.get('password');
  }

  get email() {
    return this.profileForm.get('email');
  }

  ngOnInit() {
  }
}
