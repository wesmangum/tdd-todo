/* global describe, it, before, beforeEach */
/* jshint expr:true */

'use strict';

process.env.DBNAME = 'todo-test';

var expect = require('chai').expect;
var Mongo = require('mongodb');
var app = require('../../app/app');
var request = require('supertest');
var traceur = require('traceur');
var moment = require('moment');

var leaves, clean, eat;
var Task;
var User;
var sue;
var bob;

describe('Task', function(){
  before(function(done){
    request(app)
    .get('/')
    .end(function(){
      Task = traceur.require(__dirname + '/../../app/models/task.js');
      User = traceur.require(__dirname + '/../../app/models/user.js');
      done();
    });
  });

  beforeEach(function(done){
    global.nss.db.collection('users').drop(function(){
      User.register({email:'sue@aol.com', password:'abcd'}, function(u){
        sue = u;
        User.register({email:'bob@aol.com', password:'efgh'}, function(u){
          bob = u;
        });
        global.nss.db.collection('tasks').drop(function(){
          Task.create(sue._id.toString(), {title:'leaves', dueDate:'03/03/2014', color:'green'}, function(t){
            leaves = t;
            Task.create(sue._id.toString(), {title:'clean', dueDate:'04/03/2014', color:'red'}, function(t){
              clean = t;
              Task.create(bob._id.toString(), {title:'eat', dueDate:'05/03/2014', color:'yellow'}, function(t){
                eat = t;
                done();
              });
            });
          });
        });
      });
    });
  });

  describe('.create', function(){
    it('should successfully create a task', function(done){
      Task.create(sue._id.toString(), {title:'groceries', dueDate:'01/01/2014', color:'red'}, function(t){
        expect(t).to.be.an.instanceof(Task);
        expect(t._id).to.be.ok;
        expect(t.title).to.equal('groceries');
        expect(t._id).to.be.an.instanceof(Mongo.ObjectID);
        expect(t.userId).to.deep.equal(sue._id);
        expect(t.userId).to.be.instanceof(Mongo.ObjectID);
        expect(t.dueDate).to.be.instanceof(Date);
        expect(moment(t.dueDate).format('MM/DD/YYYY')).to.equal('01/01/2014');
        expect(t.isComplete).to.be.false;
        expect(t.color).to.equal('red');
        done();
      });
    });

    it('should successfully create a task using res.locals.user._id', function(done){
      Task.create(sue._id, {title:'trash', dueDate:'02/02/2014', color:'yellow'}, function(t){
        expect(t).to.be.an.instanceof(Task);
        expect(t._id).to.be.ok;
        done();
      });
    });
  });

  describe('.findById', function(){
    it('should successfully find a task by its id', function(done){
      Task.findById(leaves._id.toString(), function(t){
        expect(t).to.be.instanceof(Task);
        expect(t.title).to.equal(leaves.title);
        done();
      });
    });

    it('should return a null taskId', function(done){
      Task.findById('not an id', function(t){
        expect(t).to.be.null;
        done();
      });
    });

    it('should return a null taskId', function(done){
      Task.findById('538de154065c89565f9bde6c', function(t){
        expect(t).to.be.null;
        done();
      });
    });
  });

  describe('.findByUserId', function(){
    it('should find tasks with sues id', function(done){
      Task.findByUserId(sue._id.toString(), function(tasks){
        expect(tasks).to.be.an('array');
        expect(tasks).to.have.length(2);
        expect(tasks[0].userId.toString()).to.equal(sue._id.toString());
        done();
      });
    });

    it('return null when not an id', function(done){
      Task.findByUserId('not an id', function(tasks){
        expect(tasks).to.be.null;
        done();
      });
    });

    it('return null when wrong userId', function(done){
      Task.findByUserId('538e12cddfd2234f6339a489', function(tasks){
        expect(tasks).to.be.null;
        done();
      });
    });
  });

  describe('#destroy', function(){
    it('should delete a task', function(done){
      leaves.destroy(function(){
        Task.findById(leaves._id.toString(), function(t){
          expect(t).to.be.null;
          done();
        });
      });
    });
  });

  describe('#toggleComplete', function(){
    it('should toggle tasks completeness to true', function(done){
      clean.toggleComplete(function(){
        expect(clean.isComplete).to.be.true;
        done();
      });
    });
  });

  describe('#save', function () {
    it('should save tasks to db', function (done) {
      clean.toggleComplete(function () {
        clean.save(function () {
          Task.findById(clean._id.toString(), function(c) {
            expect(c.isComplete).to.be.true;
            done();
          });
        });
      });
    });
  });

  describe('#edit', function(){
    it('should edit the current task', function(done){
      clean.edit({title:clean.title, dueDate:clean.dueDate, color:'green'}, function (t) {
        expect(t.color).to.equal('green');
        done();
      });
    });
  });

});
