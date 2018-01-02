{
  const requests = [
    { url: 'https://jsonplaceholder.typicode.com/users/1', status: 'pending' },
    { url: 'https://jsonplaceholder.typicode.com/users/2', status: 'pending' },
    { url: 'https://jsonplaceholder.typicode.com/users/3', status: 'pending' },
  ];

  const maxConnections = 2;

  throttleRequests(requests, maxConnections);
}

function throttleRequests(requests, maxConnections = 2) {
  const startRequest = index => {
    requests[index].status = 'in progress';
    activeRequests++;
  };

  const closeRequest = index => {
    requests[index].status = 'complete';
    activeRequests--;
  };

  const numberOfRequests = requests.length;
  let requestsCompleted = 0;
  let activeRequests = 0;

  const cycleLimit = 10; // Set really low right now. Could be set to like 10k
  let cycleCount = 0;
  let requestsPending = numberOfRequests > 0 ? true : false; // needs some safety
  while (requestsPending) {
    requests.map((k, i) => {
      if (k.status === 'pending' && activeRequests < maxConnections) {
        startRequest(i);
        fetch(k.url)
          .then(closeRequest(i))
          .then(data => data.json())
          .then(data => responseHandler(data))
          .catch(err => console.error(err));
      }
    });

    // escape hatch
    cycleCount++;
    if (requestsCompleted === numberOfRequests || cycleCount >= cycleLimit) {
      requestsPending = false;
    }
  }

  function responseHandler(data) {
    console.log(data);
  }
}
