const Request = require("./request");

// https://www.mercadobitcoin.net/api/BTC/trades/?tid=3706

const request = new Request();

const scheduler = async () => {
  console.log('Starting in...', new Date().toISOString());

  const urls = [
    { url: 'https://www.mercadobitcoin.net/api/BTC/ticker/'},
    { url: 'https://www.mercadobitcoin.net/api/BTC/orderbook/'},
  ];

  const requests = urls.map(data => ({
    ...data,
    timeout: 5000,
    method: 'get'
  })).map(params => request.makeRequest(params));

  const results = await Promise.allSettled(requests);

  const allSucceeded = [];
  const allFailed = [];

  for(const { status, value, reason } of results) {
    console.log(status, value, reason);

    if(status === 'rejected') {
      allFailed.push(reason);
      continue;
    }

    allSucceeded.push(value);
  }

  console.log({
    allSucceeded: JSON.stringify(allSucceeded)
  })
}

//const PERIOD = 10000;
// setInterval(scheduler, PERIOD);
scheduler();