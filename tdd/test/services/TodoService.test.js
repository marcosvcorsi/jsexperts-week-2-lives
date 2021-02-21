const { describe, it, before, afterEach } = require('mocha');
const { expect } = require('chai');
const { createSandbox } = require('sinon');
const uuid = require('uuid');
const TodoService = require('../../src/services/TodoService');
const Todo = require('../../src/models/todo');

const mockData = [
  {
    text: 'anytext',
    when: new Date(),
    status: 'anystatus',
    id: '1',
    $loki: 1,
    meta: {}
  }
]

describe('Todo Service Test', () => {
  let todoService;
  let sandbox;
  
  before(() => {
    sandbox = createSandbox();
  })

  beforeEach(() => {
    const dependencies = {
      todoRepository: {
        findAll: sandbox.stub().returns(mockData),
        create: sandbox.stub().returns(true)
      }
    }

    todoService = new TodoService(dependencies);
  })

  afterEach(() => {
    sandbox.restore();
  })

  describe('#findAll', () => {
    it('should return data on specific format', () => {
      const [{ meta, $loki, ...expected}] = mockData;
      
      const result = todoService.findAll();

      expect(result).to.be.deep.equal([expected]);
    })
  });

  describe('#create', () => {
    it('should not create todo item with invalid data', () => {
      const data = new Todo({
        text: '',
        when: ''
      });

      Reflect.deleteProperty(data, 'id');
      
      const expected = {
        error: {
          message: 'invalid data',
          data
        }
      };

      const result = todoService.create(data);

      expect(result).to.be.deep.equal(expected);
    })

    it('should create todo item with late status when the property is further than today', async () => {
      const expectedId = '1';
   
      const fakeUuid = sandbox.fake.returns(expectedId);
      sandbox.replace(uuid, 'v4', fakeUuid);

      const properties = {
        text: 'I must walk my dog',
        when: new Date('2020-12-01 12:00:00 GMT-0')
      }

      const data = new Todo(properties);

      const today = new Date("2020-12-02");

      sandbox.useFakeTimers(today.getTime());

      todoService.create(data);

      const expectedCallWith = {
        ...properties,
        id: expectedId,
        status: 'late'
      }

      expect(todoService.todoRepository.create.calledOnceWithExactly(expectedCallWith)).to.be.ok;
    })

    it('should create todo item with pending status', () => {
      const expectedId = '1';
   
      const fakeUuid = sandbox.fake.returns(expectedId);
      sandbox.replace(uuid, 'v4', fakeUuid);

      const properties = {
        text: 'I must walk my dog',
        when: new Date('2020-12-03 12:00:00 GMT-0')
      }

      const data = new Todo(properties);

      const today = new Date("2020-12-01");

      sandbox.useFakeTimers(today.getTime());

      todoService.create(data);

      const expectedCallWith = {
        ...properties,
        id: expectedId,
        status: 'pending'
      }

      expect(todoService.todoRepository.create.calledOnceWithExactly(expectedCallWith)).to.be.ok;
    });
  })
});