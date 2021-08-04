import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class CrudService {

  constructor(private fireStore: AngularFirestore) { }


  newProject(data: any, userID: string) {
    return this.fireStore.collection('users').doc(userID).collection('projects').add(data)
  }

  readAllProject(userID: string) {
    return this.fireStore.collection('users').doc(userID).collection('projects', ref => ref.orderBy('index')).get()
  }

  getProject(userID: string, projectID: string) {
    return this.fireStore.collection('users').doc(userID).collection('projects').doc(projectID).get()
  }

  updateProject(userID: string, projectID: string, data: any,) {
    return this.fireStore.collection('users').doc(userID).collection('projects').doc(projectID).set(data)
  }

  deleteProject(userID: string, projectID: string) {
    return this.fireStore.collection('users').doc(userID).collection('projects').doc(projectID).delete()
  }


  readTasks(userID: string, projectID: string) {
    return this.fireStore.collection('users').doc(userID).collection('projects').doc(projectID).collection('tasks', ref => ref.orderBy('index')).get()
  }

  newTask(userID: string, projectID: string, data: any,) {
    return this.fireStore.collection('users').doc(userID).collection('projects').doc(projectID).collection('tasks').add(data)
  }

  getTask(userID: string, projectID: string, taskID: string){
    return this.fireStore.collection('users').doc(userID).collection('projects').doc(projectID).collection('tasks').doc(taskID).get()
  }

  updateTask(userID: string, projectID: string, taskID: string, data: any) {
    return this.fireStore.collection('users').doc(userID).collection('projects').doc(projectID).collection('tasks').doc(taskID).set(data)
  }

  deleteTask(userID: string, projectID: string, taskID: string) {
    return this.fireStore.collection('users').doc(userID).collection('projects').doc(projectID).collection('tasks').doc(taskID).delete()
  }
/*
  deleteDoing(userID: string, projectID: string, todoID: string) {
    return this.fireStore.collection('users').doc(userID).collection('projects').doc(projectID).collection('doing').doc(todoID).delete()
  }

  deleteDone(userID: string, projectID: string, todoID: string) {
    return this.fireStore.collection('users').doc(userID).collection('projects').doc(projectID).collection('done').doc(todoID).delete()
  }




  readAllTasks(userID: string, projectID: string,) {
    this.fireStore.collection('users').doc(userID).collection('projects').doc(projectID).collection('done').valueChanges()
    this.fireStore.collection('users').doc(userID).collection('projects').doc(projectID).collection('doing').valueChanges()
    this.fireStore.collection('users').doc(userID).collection('projects').doc(projectID).collection('toDo').valueChanges()
  }*/
}

