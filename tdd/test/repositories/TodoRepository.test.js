const { describe, it, before, afterEach } = require('mocha');
const { expect } = require('chai');
const { createSandbox } = require('sinon');
const TodoRepository = require('../../src/repositories/TodoRepository');

const mockData = [
  {
    text: 'anytext',
    when: new Date(),
    status: 'anystatus',
    id: '1'
  }
]

describe('Todo Repository Test', () => {
  let todoRepository;
  let sandbox;
  
  before(() => {
    todoRepository = new TodoRepository();
    sandbox = createSandbox();
  })

  afterEach(() => {
    sandbox.restore();
  })

  describe('methods signature', () => {
    it('should call find from lokijs', () => {
      const functionName = 'find';
      const expectedReturn = mockData;

      sandbox.stub(
        todoRepository.schedule,
        functionName
      ).returns(expectedReturn);
      
      const result = todoRepository.findAll();

      expect(result).to.be.deep.equal(expectedReturn);
      expect(todoRepository.schedule[functionName].calledOnce).to.be.ok;
    })

    it('should call insertOne from lokijs', () => {
      const functionName = 'insertOne';
      const expectedReturn = true;

      sandbox.stub(
        todoRepository.schedule,
        functionName
      ).returns(expectedReturn);
      
      const data = {
        id: '1',
        status: 'anystatus',
        text: 'anytext',
        when: new Date()
      }

      const result = todoRepository.create(data);

      expect(result).to.be.deep.equal(expectedReturn);
      expect(todoRepository.schedule[functionName].calledOnceWithExactly(data)).to.be.ok;
    })
  })
})