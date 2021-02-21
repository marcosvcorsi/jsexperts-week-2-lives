const { describe, it, before } = require('mocha');
const { expect } = require('chai');
const uuid = require('uuid');
const { createSandbox } = require('sinon');
const Todo = require('../../src/models/todo');

describe('Todo Test', () => {
  let sandbox;
  
  before(() => {
    sandbox = createSandbox();
  })

  afterEach(() => {
    sandbox.restore();
  })

  describe('#isValid', () => {
    it('should return invalid when creating todo task without text', () => {
      const data = {
        text: '',
        when: new Date(),
      }

      const todo = new Todo(data);

      expect(todo.isValid()).to.be.false;
    })

    it('should return invalid when creating todo task without when property', () => {
      const data = {
        text: 'anytext',
        when: null,
      }

      const todo = new Todo(data);

      expect(todo.isValid()).to.be.false;
    })

    it('should return invalid when creating todo task with invalid when property', () => {
      const data = {
        text: 'anytext',
        when: new Date('20-12-01'),
      }

      const todo = new Todo(data);

      expect(todo.isValid()).to.be.false;
    })

    it('should have id, text, when and status properties when creating todo task', () => {
      const expectedId = '1';
   
      const fakeUuid = sandbox.fake.returns(expectedId);
      sandbox.replace(uuid, 'v4', fakeUuid);
      
      const data = {
        text: 'anytext',
        when: new Date(),
      }

      const todo = new Todo(data);
      const result = todo.isValid();

      const expectedItem = {
        ...data,
        status: '',
        id: expectedId
      }

      expect(result).to.be.ok;
      expect(uuid.v4.calledOnce).to.be.ok;
      expect(todo).to.be.deep.equal(expectedItem)
    })
  })  
})