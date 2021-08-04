import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { Project } from 'src/app/shared/models/project';
import { Task } from 'src/app/shared/models/task';
import { User } from 'src/app/shared/models/user';
import { AuthService } from 'src/app/shared/services/auth.service';
import { CrudService } from 'src/app/shared/services/crud.service';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit {
  project: Project = {
    title: '',
    author: '',
    date: 0,
    id: '',
    pinned: false,
    index: 0
  }
  user: User
  pId: string = ''
  currentPage = location.href;
  tForm: FormGroup
  newTaskForm = false
  tasks: any
  toDos: any
  doingTasks: any;
  doneTasks: any;
  deletedTasks: any
  selectedTask: Task = {
    id: '',
    title: '',
    type: '',
    index: 0,
    priority: ''
  }
  priorityOk = true
  priorityCircle: any
  prioritySpinner: any
  taskCard: any
  taskForm: any
  renaming = false
  constructor(private authService: AuthService, private route: ActivatedRoute,
    private router: Router, private crud: CrudService, private fb: FormBuilder) {
    this.pId = this.route.snapshot.paramMap.get('id') ?? ""
    this.user = this.authService.userData()
    this.router.events.subscribe((ev) => {
      if (ev instanceof NavigationEnd) {
        this.pId = this.route.snapshot.paramMap.get('id') ?? ""
        setTimeout(() => {
          this.readThisProject()
        }, 500); 
      }
    })
    this.tForm = this.fb.group({
      title: ['', Validators.required]
    })
  }



  get t() {
    return this.tForm.controls
  }

  ngOnInit(): void {

  }


  readThisProject() {
    this.crud.getProject(this.user.uid, this.pId).subscribe((data: any) => {
      this.project = data.data()
      this.project.id = this.pId
    })
    setTimeout(() => {
      this.readThisTasks()
    }, 500);
  }

  readThisTasks() {
    this.crud.readTasks(this.user.uid, this.pId).subscribe((data: any) => {
      this.tasks = []
      data.forEach((doc: any) => {
        let t: Task = doc.data()
        t.id = doc.id
        this.tasks.push(t)
      })
      this.filterTasks()
    })

  }

  filterTasks() {
    this.toDos = this.tasks.filter((t: { type: string; }) => t.type == 'todo')
    this.doingTasks = this.tasks.filter((t: { type: string; }) => t.type == 'doing')
    this.doneTasks = this.tasks.filter((t: { type: string; }) => t.type == 'done')
    this.toDos.sort((a: { index: number; }, b: { index: number; }) => a.index - b.index)
    this.doingTasks.sort((a: { index: number; }, b: { index: number; }) => a.index - b.index)
    this.doneTasks.sort((a: { index: number; }, b: { index: number; }) => a.index - b.index)
  }

  addTask() {
    if (!this.tForm.invalid) {
      const task: Task = {
        id: '',
        title: this.t.title.value,
        type: 'todo',
        index: this.toDos.length,
        priority: 'normal'
      }
      this.crud.newTask(this.user.uid, this.project.id, task).then(success => {
        console.log("Task created", success)
        this.toDos.push(task)
        this.readThisTasks()
        setTimeout(() => {
          this.newTaskForm = false
        }, 200);
      }).catch(error => {
        console.log("Error", error)
      })
    }
  }

  showRenameForm(index: number) {
    if (this.selectedTask.type == 'todo') {
      this.taskCard = document.getElementById('card-todo' + index)
      this.taskForm = document.getElementById('list-form-todo' + index)
      this.taskCard.classList.toggle("hide")
      this.taskForm.classList.toggle("hide")
    } else {
      this.taskCard = document.getElementById('card-doing' + index)
      this.taskForm = document.getElementById('list-form-doing' + index)
      this.taskCard.classList.toggle("hide")
      this.taskForm.classList.toggle("hide")
    }
    this.tForm.patchValue({
      title: this.selectedTask.title
    })
  }

  
  renameTask() {
    if (!this.tForm.invalid) {
      const task: Task = {
        id: this.selectedTask.id,
        title: this.t.title.value,
        type: this.selectedTask.type,
        index: this.selectedTask.index,
        priority: this.selectedTask.priority
      }
      this.crud.updateTask(this.user.uid, this.project.id, this.selectedTask.id, task).then(success => {
        console.log("Task updated")
        this.readThisTasks()
        this.tForm.reset()
      }).catch(error => {
        console.log(error)
      })
    }
  }

  toggleNewTaskForm() {
    if (this.newTaskForm == false) {
      this.tForm.reset()
      this.newTaskForm = true
    } else {
      this.newTaskForm = false
    }
  }

  changePriority(index: number) {
    if (this.selectedTask.type == 'todo') {
      this.priorityCircle = document.getElementById('priority-' + index)
      this.prioritySpinner = document.getElementById('spinner-' + index)
      this.priorityCircle.classList.toggle("hide")
      this.prioritySpinner.classList.toggle("hide")
    } else {
      this.priorityCircle = document.getElementById('priorityDoing-' + index)
      this.prioritySpinner = document.getElementById('spinnerDoing-' + index)
      this.priorityCircle.classList.toggle("hide")
      this.prioritySpinner.classList.toggle("hide")
    }

    if (this.selectedTask.priority == 'normal') {
      let t: Task = {
        id: this.selectedTask.id,
        title: this.selectedTask.title,
        type: this.selectedTask.type,
        index: this.selectedTask.index,
        priority: 'urgent'
      }
      this.crud.updateTask(this.user.uid, this.project.id, this.selectedTask.id, t).then(success => {
        console.log("Task updated")
      }).catch(error => {
        console.log(error)
      })
      this.readThisTasks()
    }
    else {
      let t: Task = {
        id: this.selectedTask.id,
        title: this.selectedTask.title,
        type: this.selectedTask.type,
        index: this.selectedTask.index,
        priority: 'normal'
      }
      this.crud.updateTask(this.user.uid, this.project.id, this.selectedTask.id, t).then(success => {
        console.log("Task updated")
      }).catch(error => {
        console.log(error)
      })
    }
    setTimeout(() => {
      this.readThisTasks()
      setTimeout(() => {
        this.priorityCircle.classList.toggle("hide")
        this.prioritySpinner.classList.toggle("hide")
      }, 1000);
    }, 300);
  }


  getTaskID(taskID: string, index: number) {
    this.crud.getTask(this.user.uid, this.pId, taskID).subscribe((data: any) => {
      this.selectedTask = data.data()
      this.selectedTask.id = data.id
      this.selectedTask.index = index
    })
  }


  drop(event: CdkDragDrop<any[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      let selectedTask: Task = {
        id: this.selectedTask.id,
        title: this.selectedTask.title,
        type: this.selectedTask.type,
        index: event.currentIndex,
        priority: this.selectedTask.priority
      }
      this.crud.updateTask(this.user.uid, this.project.id, this.selectedTask.id, selectedTask).then(success => {
        console.log("Task updated")
      }).catch(error => {
        console.log(error)
      })
    } else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
      //Form TODO to DOING
      if (event.previousContainer.id === 'todo-List' && event.container.id === 'doing-List') {
        let selectedTask: Task = {
          id: this.selectedTask.id,
          title: this.selectedTask.title,
          type: 'doing',
          index: event.currentIndex,
          priority: this.selectedTask.priority
        }
        this.crud.updateTask(this.user.uid, this.project.id, this.selectedTask.id, selectedTask).then(success => {
          console.log("Task updated")
        }).catch(error => {
          console.log(error)
        })
      }
      //From DOING to TODO
      if (event.previousContainer.id === 'doing-List' && event.container.id === 'todo-List') {
        let selectedTask: Task = {
          id: this.selectedTask.id,
          title: this.selectedTask.title,
          type: 'todo',
          index: event.currentIndex,
          priority: this.selectedTask.priority
        }
        this.crud.updateTask(this.user.uid, this.project.id, this.selectedTask.id, selectedTask).then(success => {
          console.log("Task updated")
        }).catch(error => {
          console.log(error)
        })
      }
      //From DOING to DONE
      if (event.previousContainer.id === 'doing-List' && event.container.id === 'done-List') {
        let selectedTask: Task = {
          id: this.selectedTask.id,
          title: this.selectedTask.title,
          type: 'done',
          index: event.currentIndex,
          priority: this.selectedTask.priority
        }
        this.crud.updateTask(this.user.uid, this.project.id, this.selectedTask.id, selectedTask).then(success => {
          console.log("Task updated")
        }).catch(error => {
          console.log(error)
        })
      }
      //From DONE to DOING
      if (event.previousContainer.id === 'done-List' && event.container.id === 'doing-List') {
        let selectedTask: Task = {
          id: this.selectedTask.id,
          title: this.selectedTask.title,
          type: 'doing',
          index: event.currentIndex,
          priority: this.selectedTask.priority
        }
        this.crud.updateTask(this.user.uid, this.project.id, this.selectedTask.id, selectedTask).then(success => {
          console.log("Task updated")
        }).catch(error => {
          console.log(error)
        })
      }
      //From DONE to TODO
      if (event.previousContainer.id === 'done-List' && event.container.id === 'todo-List') {
        let selectedTask: Task = {
          id: this.selectedTask.id,
          title: this.selectedTask.title,
          type: 'todo',
          index: event.currentIndex,
          priority: this.selectedTask.priority
        }
        this.crud.updateTask(this.user.uid, this.project.id, this.selectedTask.id, selectedTask).then(success => {
          console.log("Task updated")
        }).catch(error => {
          console.log(error)
        })
      }
      //From TODO to DONE
      if (event.previousContainer.id === 'todo-List' && event.container.id === 'done-List') {
        let selectedTask: Task = {
          id: this.selectedTask.id,
          title: this.selectedTask.title,
          type: 'done',
          index: event.currentIndex,
          priority: this.selectedTask.priority
        }
        this.crud.updateTask(this.user.uid, this.project.id, this.selectedTask.id, selectedTask).then(success => {
          console.log("task updated", success)
        }).catch(error => {
          console.log(error)
        })
      }
    }
  }


  deleteCompletedTask(itemID: string) {
    setTimeout(() => {
      this.crud.deleteTask(this.user.uid, this.pId, itemID).then(success => {
        this.doneTasks = this.doneTasks.filter((t: { id: string; }) => t.id != itemID)
        this.toDos = this.toDos.filter((t: { id: string; }) => t.id != itemID)
        this.doingTasks = this.doingTasks.filter((t: { id: string; }) => t.id != itemID)
        console.log("Post eliminado", success)
      }).catch(error => {
        console.log(error)
      })
    }, 200);
  }

  addT(event: any) {
   this.addTask()
  }

  renameT(event:any){
    this.renameTask()
  }



}
