import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';

@Component({
  selector: 'app-delete-users',
  templateUrl: './delete-users.component.html',
  styleUrls: ['./delete-users.component.css','../register-users/register-users.component.css']
})
export class DeleteUsersComponent implements OnInit {

  private updates: any[];
  private updateEmails: string[];

  users = [
    {
      name: "Andrew Moore",
      email: "andrew.moore9497@gmail.com",
      role: "ROLE_ADMIN"
    },
    {
      name: "andrew",
      email: "ocsmoore@gmail.com",
      role: "ROLE_USER"
    },
    {
      name: "Andrew Moore",
      email: "andrew.moore9497@gmail.com",
      role: "ROLE_ADMIN"
    },
    {
      name: "andrew",
      email: "ocsmoore@gmail.com",
      role: "ROLE_USER"
    },
    {
      name: "Andrew Moore",
      email: "andrew.moore9497@gmail.com",
      role: "ROLE_ADMIN"
    },
    {
      name: "andrew",
      email: "ocsmoore@gmail.com",
      role: "ROLE_USER"
    },
    {
      name: "Andrew Moore",
      email: "andrew.moore9497@gmail.com",
      role: "ROLE_ADMIN"
    },
    {
      name: "andrew",
      email: "ocsmoore@gmail.com",
      role: "ROLE_USER"
    },
    {
      name: "Andrew Moore",
      email: "andrew.moore9497@gmail.com",
      role: "ROLE_ADMIN"
    },
    {
      name: "andrew",
      email: "ocsmoore@gmail.com",
      role: "ROLE_USER"
    },
    {
      name: "Andrew Moore",
      email: "andrew.moore9497@gmail.com",
      role: "ROLE_ADMIN"
    },
    {
      name: "andrew",
      email: "ocsmoore@gmail.com",
      role: "ROLE_USER"
    },
    {
      name: "Andrew Moore",
      email: "andrew.moore9497@gmail.com",
      role: "ROLE_ADMIN"
    },
    {
      name: "andrew",
      email: "ocsmoore@gmail.com",
      role: "ROLE_USER"
    }
  ]

  constructor(
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.updates = [];
    this.updateEmails = [];
    this.users.sort((a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : a.name.toLowerCase() > b.name.toLowerCase() ? 1 : 0);
  }

  addUser(name: string, email:string){
    
    if(this.updateEmails.includes(email)){
      this.updateEmails.splice(this.updateEmails.indexOf(email),1);
      this.updates.splice(this.updateEmails.indexOf(email),1);
    } else{
      this.updates.push({
        name: name,
        email: email
      });
      this.updateEmails.push(email);
    }

    console.log(this.updateEmails);
    console.log(this.updates);
    
  }

  onSubmit(){
    if(this.updateEmails.length===0){
      alert('Please make at least one selection first.');
    }
    else{
      const dialogRef = this.dialog.open(DeleteUsers, {
        width: "650px",
        height: "400px",
        data: this.updates
      })
      dialogRef.afterClosed().subscribe(result => {
        console.log(result);
      })
    }
  }

}

@Component({
  selector: 'user-delete',
  templateUrl: 'user-delete-confirm.html',
  styleUrls: ['user-delete-confirm.css','delete-users.component.css','../register-users/register-users.component.css','../update-roles/role-confirm.css']
})
export class DeleteUsers{
  constructor(
    private dialog: MatDialogRef<DeleteUsers>,
    @Inject(MAT_DIALOG_DATA)private data: any
  ){}

  close(){
    this.dialog.close('cancel');
  }

  confirm(){
    console.log(this.data);
    this.dialog.close('confirmed');
  }

}
