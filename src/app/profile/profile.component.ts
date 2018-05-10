import { Component, OnInit } from '@angular/core';
import {AuthService} from '../services/auth.service';
import {Router} from '@angular/router';
import swal from 'sweetalert2';
import {Globals} from '../globals';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: Object;
  name: string;
  username: string;
  email: string;
  userId: string;
  workflows: object;

  constructor(private authService: AuthService,
              private router: Router,
              private globals: Globals) {
  }

  ngOnInit() {
    this.authService.getProfile().subscribe(profile => {
        this.user = profile.user;
        this.name = profile.user.name;
        this.username = profile.user.username;
        this.email = profile.user.email;
        this.userId = profile.user._id;
      },
      err => {
        console.log(err);
        return false;
      });

    this.authService.getWorkflows().subscribe(workflows =>{
      this.workflows = workflows;

      },
      err => {
        console.log(err);
        return false;
      });
  }

  open(workflow){
    swal({
      title: 'Are you sure?',
      text: 'All unsaved changess will be lost!',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, open it!'
    }).then((result) => {

      this.globals.workflowName = workflow.name;
      this.globals.connectors = workflow.connArray;
      this.globals.compList = workflow.compArray;
      swal({
        title: 'Loading!',
        text: 'Please wait',
        timer: 2000,
        onOpen: () => {
          swal.showLoading();
        }
      }).then((result) => {
        if (
          // Read more about handling dismissals
        result.dismiss === swal.DismissReason.timer
        ) {
          this.router.navigate(['/']);
        }
      });

    });
  }
}
