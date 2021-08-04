import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Project } from 'src/app/shared/models/project';
import { AuthService } from 'src/app/shared/services/auth.service';
import { CrudService } from 'src/app/shared/services/crud.service';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  user: any;
  showSide = true
  projects: any
  selectedProject: Project = {
    title: '',
    author: '',
    date: 0,
    id: '',
    pinned: false,
    index: 0
  };
  pForm: FormGroup
  plusShow = false
  menuShow = false
  navbarHeight: number = 0;
  navbar: any
  userDisplayWidth: number = 0
  userDisplayHeight: number = 0
  mainContainerHeight: number = 0
  pCircle: any
  pSpinner: any
  pStar: any
  ind: any
  pCard: any;
  pCardForm: any
  mainHide = true
  loadNP = false
  constructor(private authService: AuthService, private fire: AngularFirestore, private crud: CrudService, private fb: FormBuilder, private router: Router, private spinner: NgxSpinnerService) {
    this.user = this.authService.userData()
    this.readProjects()
    this.pForm = this.fb.group({
      title: ['', Validators.required]
    })

  }


  ngOnInit(): void {

    this.spinner.show('logIn');
    setTimeout(() => {
      this.mainHide = false
      this.spinner.hide('logIn');
    }, 5000);
    this.calcMainHeight()
    setTimeout(() => {
      if (this.projects.length != 0) {
        this.router.navigate(['/dashboard', (this.projects[0].id)])
      } else {
        this.router.navigate(['/dashboard'])
      }
    }, 2000);
  }

  get f() {
    return this.pForm.controls
  }


  calcMainHeight() {
    this.userDisplayWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    this.userDisplayHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    this.navbar = document.getElementById('navbar')
    this.navbarHeight = this.navbar.offsetHeight;
    this.mainContainerHeight = this.userDisplayHeight - this.navbarHeight
  }


  toggleSidenav() {
    if (this.showSide == true) {
      this.showSide = false
      console.log(this.projects)
    } else {
      this.showSide = true
    }
  }

  createProject() {
    this.spinner.show('new-P-spinner')
    this.loadNP = true
    if (!this.pForm.invalid) {
      const p: Project = {
        title: this.f.title.value,
        author: this.user.uid,
        date: new Date().getTime(),
        id: '',
        pinned: false,
        index: this.projects.length
      }
      this.crud.newProject(p, this.user.uid).then(success => {
        console.log("Post creado", success)
        this.readProjects()
        setTimeout(() => {
          console.log(this.projects[this.projects.length - 1].id)
          this.router.navigate(['/dashboard', (this.projects[this.projects.length - 1].id)])
          document.getElementById('closeNewProjectModal')?.click()
          setTimeout(() => {
            this.spinner.hide('new-P-spinner')
            this.loadNP = false
            this.pForm.reset()
          }, 500);
        }, 2000);
      }).catch(error => {
        console.log("Error", error)
      })
    }
  }

  readProjects() {
    this.crud.readAllProject(this.user.uid).subscribe(data => {
      this.projects = []
      data.forEach((doc: any) => {
        let p: Project = doc.data()
        p.id = doc.id
        this.projects.push(p)
      })
    })
  }

  readThisProject(pId: string) {
    this.crud.getProject(this.user.uid, pId).subscribe((data: any) => {
      this.selectedProject = data.data()
      this.selectedProject.id = data.id
      console.log(this.selectedProject)
    })
  }

  deleteP() {
    this.spinner.show('del-P-spinner')
    this.loadNP = true
    this.crud.deleteProject(this.user.uid, this.selectedProject.id).then(success => {
      console.log("P eliminado")
      
      this.readProjects()
      setTimeout(() => {
        if (this.projects.length != 0) {
          this.router.navigate(['/dashboard', (this.projects[0].id)])
        } else {
          this.router.navigate(['/dashboard'])
        }
        setTimeout(() => {
          document.getElementById('closeDelete')?.click()
          setTimeout(() => {
            this.spinner.hide('del-P-spinner')
            this.loadNP = false
          }, 1000);
        }, 1000);
      }, 1500);
    }).catch(error => {
      console.log(error)
    })
  }


  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.projects, event.previousIndex, event.currentIndex);
    this.projects.forEach((p: {
      title: string,
      author: string,
      date: number,
      id: string,
      pinned: boolean,
      index: number,
    }, i: number) => {
      p.title = p.title
      p.author = p.author
      p.id = p.id
      p.pinned = p.pinned
      p.date = p.date
      p.index = i;
      this.crud.updateProject(this.user.uid, p.id, p).then(success => {
        console.log("Ok!")
      }).catch(error => {
        console.log(error)
      })
    });
    setTimeout(() => {
      this.readProjects()
      setTimeout(() => {
        console.log("p update", this.projects)
      }, 1000);
    }, 500);
  }

  showRenameForm(index: number) {
    this.pCard = document.getElementById('card-project' + index)
    this.pCardForm = document.getElementById('list-form-project' + index)
    this.pCard.classList.toggle("hide")
    this.pCardForm.classList.toggle("hide")
    this.pForm.patchValue({
      title: this.selectedProject.title
    })
  }

  renameProject() {
    if (!this.pForm.invalid) {
      const p: Project = {
        id: this.selectedProject.id,
        title: this.f.title.value,
        pinned: this.selectedProject.pinned,
        index: this.selectedProject.index,
        author: this.selectedProject.author,
        date: new Date().getTime(),
      }
      this.crud.updateProject(this.user.uid, this.selectedProject.id, p).then(success => {
        console.log("Project updated")
        this.readProjects()
        this.pForm.reset()
      }).catch(error => {
        console.log(error)
      })
    }
  }


  pinProject(index: number) {
    this.pCircle = document.getElementById('circleP' + index)
    this.pSpinner = document.getElementById('spinnerP' + index)
    this.pCircle.classList.toggle("hide")
    this.pSpinner.classList.toggle("hide")
    if (!this.selectedProject.pinned) {
      let p: Project = {
        id: this.selectedProject.id,
        title: this.selectedProject.title,
        author: this.selectedProject.author,
        index: this.selectedProject.index,
        pinned: true,
        date: this.selectedProject.date
      }
      this.crud.updateProject(this.user.uid, this.selectedProject.id, p).then(success => {
        console.log("Ok!")
      }).catch(error => {
        console.log(error)
      })
      this.readProjects()
    }
    else {
      let p: Project = {
        id: this.selectedProject.id,
        title: this.selectedProject.title,
        author: this.selectedProject.author,
        index: this.selectedProject.index,
        pinned: false,
        date: this.selectedProject.date
      }
      this.projects.forEach((item: { index: any; }, i: number) => {
        item.index = i;
        this.crud.updateProject(this.user.uid, this.selectedProject.id, p).then(success => {
          console.log("Ok!")
        }).catch(error => {
          console.log(error)
        })
      });
    }
    setTimeout(() => {
      this.readProjects()
      setTimeout(() => {
        this.pCircle.classList.toggle("hide")
        this.pSpinner.classList.toggle("hide")
      }, 800);
    }, 300);
  }


  logout() {
    this.authService.signOut()
    setTimeout(() => {
      this.router.navigate(['/sign-in'])
    }, 1000);

  }


}


