const { describe, it, before, afterEach } = require('mocha');
const { createSandbox } = require('sinon');
const assert = require('assert');
const Pagination = require('../src/pagination');

describe('Pagination Helpers', () => {
  let sandbox;

  before(() => {
    sandbox = createSandbox();
  })

  afterEach(() => {
    sandbox.restore();
  })

  describe('#Pagination', () => {
    it('#sleep should be a Promise object and returning void', async () => {
      const clock = sandbox.useFakeTimers();
      const time = 1;
      
      const pendingPromise = Pagination.sleep(time);
      clock.tick(time);

      assert.ok(pendingPromise instanceof Promise);

      const result = await pendingPromise;

      assert.ok(result === undefined);
    });

    describe('#handleRequest', () => {
      it('should retry an request twice before throwing an exception', async () => {
        const expectedCallCount = 2
        const expectedTimeout = 10
  
        const pagination = new Pagination()
        pagination.maxRetries = expectedCallCount
        pagination.retryTimeout = expectedTimeout
        pagination.maxRequestTimeout = expectedTimeout
  
        const error = new Error("timeout")
  
        sandbox.spy(pagination, pagination.handleRequest.name)
  
        sandbox.stub(
          Pagination,
          Pagination.sleep.name
        ).resolves()
  
        sandbox.stub(
          pagination.request,
          pagination.request.makeRequest.name
        ).rejects(error)
  
        const dataRequest = { url: 'https://google.com', page: 0 }
  
        try {
          await pagination.handleRequest(dataRequest)
        } catch(error) {
          assert.ifError(error);
        }
        
        assert.deepStrictEqual(pagination.handleRequest.callCount, expectedCallCount)
  
        const lastCall = 1;
        const firstCallArg = pagination.handleRequest.getCall(lastCall).firstArg
        const firstCallRetries = firstCallArg.retries
        assert.deepStrictEqual(firstCallRetries, expectedCallCount)
  
        const expectedArgs = {
          url: `${dataRequest.url}?tid=${dataRequest.page}`,
          method: 'get',
          timeout: expectedTimeout
        }
        
        const firstCallArgs = pagination.request.makeRequest.getCall(0).args
        assert.deepStrictEqual(firstCallArgs, [expectedArgs])
  
        assert.ok(Pagination.sleep.calledWithExactly(expectedTimeout))
      })
  
      it('should return data on success', async () => {
        const data = { result: 'ok' };
  
        const pagination = new Pagination();
  
        sandbox.stub(
          pagination.request,
          pagination.request.makeRequest.name,
        ).resolves(data);
  
        const result = await pagination.handleRequest({
          url: 'https://google.com',
          page: 1
        });
  
        assert.deepStrictEqual(result, data);
      })
    })

    describe('#getPaginated', () => {
      const responseMock = [
        {
            "tid": 5705,
            "date": 1373123005,
            "type": "sell",
            "price": 196.52,
            "amount": 0.01
        },
        {
            "tid": 5706,
            "date": 1373124523,
            "type": "buy",
            "price": 200,
            "amount": 0.3
        }
      ];

      it('should update request id on each request', async () => {
        const pagination = new Pagination();

        sandbox.stub(
          Pagination,
          Pagination.sleep.name
        ).resolves()
  
        sandbox.stub(
          pagination,
          pagination.handleRequest.name
        )
        .onCall(0).resolves([responseMock[0]])
        .onCall(1).resolves([responseMock[1]])
        .onCall(2).resolves([])
        
        sandbox.spy(pagination, pagination.getPaginated.name);

        const data = { url: 'https://google.com', page: 1};

        const secondCallExpectation = {
          ...data,
          page: responseMock[0].tid
        }

        const thirdCallExpectation = {
          ...secondCallExpectation,
          page: responseMock[1].tid
        }

        const gen = pagination.getPaginated(data);

        for await (const result of gen) {}

        const getFirstArgFromCall = value => pagination.handleRequest.getCall(value).firstArg;

        assert.deepStrictEqual(getFirstArgFromCall(0), data);
        assert.deepStrictEqual(getFirstArgFromCall(1), secondCallExpectation);
        assert.deepStrictEqual(getFirstArgFromCall(2), thirdCallExpectation);
        
      })

      it('should stop requesting when request return an empty array', async () => {
        const expectedThreshold = 20;
        const pagination = new Pagination();
        pagination.threshold = expectedThreshold;

        sandbox.stub(
          Pagination,
          Pagination.sleep.name
        ).resolves()
  
        sandbox.stub(
          pagination,
          pagination.handleRequest.name
        )
        .onCall(0).resolves([responseMock[0]])
        .onCall(1).resolves([]);

        sandbox.spy(pagination, pagination.getPaginated.name);

        const data = { url: 'https://google.com', page: 1};

        const iterator = await pagination.getPaginated(data);

        const [firstResult, secondResult] = await Promise.all([
          iterator.next(),
          iterator.next()
        ]);

        const expectedFirstCall = { done: false, value: [responseMock[0]]};

        assert.deepStrictEqual(firstResult, expectedFirstCall);

        const expectedSecondCall = { done: true, value: undefined};

        assert.deepStrictEqual(secondResult, expectedSecondCall);

        assert.deepStrictEqual(Pagination.sleep.callCount, 1);
        assert.ok(Pagination.sleep.calledWithExactly(expectedThreshold));
      })
    })
  })
})