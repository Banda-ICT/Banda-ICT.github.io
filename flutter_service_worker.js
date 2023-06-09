"use strict";
const MANIFEST = "flutter-app-manifest";
const TEMP = "flutter-temp-cache";
const CACHE_NAME = "flutter-app-cache";

const RESOURCES = {
  "version.json": "2d1e8e250d5d06b6b4fe2a2196d16032",
  "index.html": "83d56924df39c488a531ad7a31e91f6f",
  "/": "83d56924df39c488a531ad7a31e91f6f",
  "main.dart.js": "ea6d558c85997f4fa42bb79159100587",
  "flutter.js": "6fef97aeca90b426343ba6c5c9dc5d4a",
  "favicon.png": "5dcef449791fa27946b3d35ad8803796",
  "icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
  "icons/Icon-maskable-192.png": "c457ef57daa1d16f64b27b786ec2ea3c",
  "icons/Icon-maskable-512.png": "301a7604d45b3e739efc881eb04896ea",
  "icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
  "manifest.json": "823fb3e8602f92f44af0d683d353cde0",
  "assets/AssetManifest.json": "8e6394392808928ce764a13fc4571136",
  "assets/NOTICES": "f3b54a89a590465155dea387ddd8714d",
  "assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
  "assets/packages/cupertino_icons/assets/CupertinoIcons.ttf":
    "57d849d738900cfd590e9adc7e208250",
  "assets/shaders/ink_sparkle.frag": "57f2f020e63be0dd85efafc7b7b25d80",
  "assets/AssetManifest.bin": "4582f20c943448d3c6ee87c13e7b445e",
  "assets/fonts/MaterialIcons-Regular.otf": "62ec8220af1fb03e1c20cfa38781e17e",
  "assets/assets/images/diary_bubble_upper.png":
    "97554d6685b1838c68c6488886957698",
  "assets/assets/images/Group.png": "bda593b8ea3cb64f7259d75f965dbb4d",
  "assets/assets/images/diary_background.png":
    "9633c8c452f1ad992ffdf6e42cb5af3a",
  "assets/assets/images/Rectangle.png": "014697ce2c650643c9cf983e049d36bf",
  "assets/assets/images/diary_bubble_lower.png":
    "85ff3c1c83f35aaa82df1ac864e53fc3",
  "assets/assets/images/NavigationBar/MyPageIcon.png":
    "eefa846c0d813ab495b5339013a0e088",
  "assets/assets/images/NavigationBar/SearchFeedIcon.png":
    "ca04b381fbb5414757da12a212465eac",
  "assets/assets/images/NavigationBar/MainFeedIcon.png":
    "3185aba969e9e512b50e91001b14c079",
  "assets/assets/images/NavigationBar/CameraPageIconFilled.png":
    "5b3e3b4f305d08896c88cbeca84cdc3e",
  "assets/assets/images/NavigationBar/SearchFeedIconFilled.png":
    "3ae6f3008ee63fa6a4c073ecb9182a92",
  "assets/assets/images/NavigationBar/CameraPageIcon.png":
    "88243a9fc1c686fa32e29b90fac83406",
  "assets/assets/images/NavigationBar/MainFeedIconFilled.png":
    "dc42ec9f12762a9e482da67e3ce49c78",
  "assets/assets/images/diary_background%2520copy.png":
    "9633c8c452f1ad992ffdf6e42cb5af3a",
  "assets/assets/images/logo.png": "9ed26e4a956d6b7cbd8f5182e21462c8",
  "assets/assets/images/Group1.png": "273ff52d4811538b48a2a98ad821970f",
  "assets/assets/images/logo%2520copy.png": "9ed26e4a956d6b7cbd8f5182e21462c8",
  "assets/assets/images/Group%252041.png": "12de0e0a8357bf74a4559b9d6b606a2d",
  "canvaskit/skwasm.js": "ba6e1869d2fb110eba7c1f5571dabd2e",
  "canvaskit/skwasm.wasm": "92d3b1eac88136d70d637a913a4c1bce",
  "canvaskit/chromium/canvaskit.js": "cc1b69a365ddc1241a9cad98f28dd9b6",
  "canvaskit/chromium/canvaskit.wasm": "75851278f2f7400386503b1eb36a96bf",
  "canvaskit/canvaskit.js": "73df95dcc5f14b78d234283bf1dd2fa7",
  "canvaskit/canvaskit.wasm": "9f96ceab0a78c512276714a2486880a0",
  "canvaskit/skwasm.worker.js": "19659053a277272607529ef87acf9d8a",
};
// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "main.dart.js",
  "index.html",
  "assets/AssetManifest.json",
  "assets/FontManifest.json",
];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, { cache: "reload" }))
      );
    })
  );
});
// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function (event) {
  return event.waitUntil(
    (async function () {
      try {
        var contentCache = await caches.open(CACHE_NAME);
        var tempCache = await caches.open(TEMP);
        var manifestCache = await caches.open(MANIFEST);
        var manifest = await manifestCache.match("manifest");
        // When there is no prior manifest, clear the entire cache.
        if (!manifest) {
          await caches.delete(CACHE_NAME);
          contentCache = await caches.open(CACHE_NAME);
          for (var request of await tempCache.keys()) {
            var response = await tempCache.match(request);
            await contentCache.put(request, response);
          }
          await caches.delete(TEMP);
          // Save the manifest to make future upgrades efficient.
          await manifestCache.put(
            "manifest",
            new Response(JSON.stringify(RESOURCES))
          );
          // Claim client to enable caching on first launch
          self.clients.claim();
          return;
        }
        var oldManifest = await manifest.json();
        var origin = self.location.origin;
        for (var request of await contentCache.keys()) {
          var key = request.url.substring(origin.length + 1);
          if (key == "") {
            key = "/";
          }
          // If a resource from the old manifest is not in the new cache, or if
          // the MD5 sum has changed, delete it. Otherwise the resource is left
          // in the cache and can be reused by the new service worker.
          if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
            await contentCache.delete(request);
          }
        }
        // Populate the cache with the app shell TEMP files, potentially overwriting
        // cache files preserved above.
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put(
          "manifest",
          new Response(JSON.stringify(RESOURCES))
        );
        // Claim client to enable caching on first launch
        self.clients.claim();
        return;
      } catch (err) {
        // On an unhandled exception the state of the cache cannot be guaranteed.
        console.error("Failed to upgrade service worker: " + err);
        await caches.delete(CACHE_NAME);
        await caches.delete(TEMP);
        await caches.delete(MANIFEST);
      }
    })()
  );
});
// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf("?v=") != -1) {
    key = key.split("?v=")[0];
  }
  if (
    event.request.url == origin ||
    event.request.url.startsWith(origin + "/#") ||
    key == ""
  ) {
    key = "/";
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == "/") {
    return onlineFirst(event);
  }
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return (
          response ||
          fetch(event.request).then((response) => {
            if (response && Boolean(response.ok)) {
              cache.put(event.request, response.clone());
            }
            return response;
          })
        );
      });
    })
  );
});
self.addEventListener("message", (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === "skipWaiting") {
    self.skipWaiting();
    return;
  }
  if (event.data === "downloadOffline") {
    downloadOffline();
    return;
  }
});
// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request)
      .then((response) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
      .catch((error) => {
        return caches.open(CACHE_NAME).then((cache) => {
          return cache.match(event.request).then((response) => {
            if (response != null) {
              return response;
            }
            throw error;
          });
        });
      })
  );
}
