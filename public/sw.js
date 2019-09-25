/* eslint-disable no-restricted-globals */
self.addEventListener("install", function(event) {
  console.log("Installing New SW...");

  event.waitUntil(self.importScripts(["./idb.js"]));

  // event.waitUntil(self.skipWaiting());
  event.waitUntil(
    caches.open("page-fetch").then(function(cache) {
      return cache.addAll(["/", "/add"]).then(function() {
        return self.skipWaiting();
      });
    })
  );

  idb.getDB();
});

self.addEventListener("activate", function(event) {
  console.log("Activating SW...");
  event.waitUntil(self.clients.claim()); // Become available to all pages
});

self.addEventListener("fetch", function(event) {
  if (event.request.method === "GET" && event.request.url.includes("/add?")) {
    var responseInit = {
      status: 302,
      statusText: "Found",
      headers: {
        Location: "/"
      }
    };

    var redirectResponse = new Response("", responseInit);
    event.respondWith(redirectResponse);

    const url = new URL(event.request.url);
    const actionUrl = url.searchParams.get("url");
    const title = url.searchParams.get("title");
    const text = url.searchParams.get("text");

    console.log({ actionUrl: actionUrl || text, title, url });

    addItemToDB({ url: actionUrl || text, title }).then(async () => {
      const arr = await idb.getAll();
      sendMessage({ action: "LIST", data: arr });
    });
  } else {
    event.respondWith(
      caches.open("page-fetch").then(function(cache) {
        console.log(event.request.url);
        return cache.match(event.request).then(function(response) {
          if (event.request.url.startsWith("chrome-extension")) {
            return fetch(event.request);
          } else {
            return (
              response ||
              fetch(event.request).then(function(response) {
                cache.put(event.request, response.clone());
                return response;
              })
            );
          }
        });
      })
    );
  }
});

const sendMessage = (...args) => {
  self.clients
    .matchAll()
    .then(all => all.map(client => client.postMessage(...args)));
};

self.addEventListener("message", async event => {
  const {
    data: { action, data }
  } = event;

  switch (action) {
    case "ADD_ITEM": {
      addItemToDB(data);

      const arr = await idb.getAll();
      sendMessage({ action: "LIST", data: arr });
      break;
    }
    case "DELETE_ITEM": {
      idb.delete(data);

      const arr = await idb.getAll();
      sendMessage({ action: "LIST", data: arr });
      break;
    }
    case "GET_LIST": {
      const arr = await idb.getAll();
      sendMessage({ action: "LIST", data: arr });
      break;
    }
    default: {
      sendMessage({ action: "ERROR" });
    }
  }
});

const addItemToDB = async data => {
  idb.add(data);
};
