// var bcrypt = require('bcrypt');
var taskCollection = global.nss.db.collection('tasks');
var Mongo = require('mongodb');
var _ = require('lodash');

class Task{
  static create(userId, obj, fn){
    taskCollection.findOne({title:obj.title}, (e,t)=>{
      if(!t){

        if(typeof userId === 'string'){userId = Mongo.ObjectID(userId);}

        var task = new Task();
        task.title = obj.title;
        task.dueDate = new Date(obj.dueDate);
        task.color = obj.color;
        task.isComplete = false;
        task.userId = userId;
        taskCollection.save(task, ()=>fn(task));
      }else{
        fn(null);
      }
    });
  }

  static findById(id, fn){
    if(id.length !== 24){fn(null); return;}

    id = Mongo.ObjectID(id);
    taskCollection.findOne({_id:id}, (e,t)=>{
      if(!t){
        fn(null);
      }else{
        t = _.create(Task.prototype, t);
        fn(t);
      }
    });
  }

  static findByUserId(userId, fn){
    if(userId.length !== 24){fn(null); return;}

    userId = Mongo.ObjectID(userId);
    taskCollection.find({userId:userId}).toArray((e,t)=>{
      if(t.length > 0){
        fn(t);
      }else{
        fn(null);
      }
    });
  }

  destroy(fn){
    this._id = Mongo.ObjectID(this._id);
    taskCollection.findAndRemove({_id: this._id}, ()=>fn());
  }

  toggleComplete(fn){
    this.isComplete = !this.isComplete;
    fn();
  }

  save(fn){
    taskCollection.save(this, ()=>fn());
  }

  edit(obj, fn){
    this.title = obj.title;
    this.dueDate = obj.dueDate;
    this.color = obj.color;
    fn(this);
  }

}

module.exports = Task;
