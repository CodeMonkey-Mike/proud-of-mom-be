## Upload file
1. Server side
Using `graphql-upload` package.
Due to issue duplication between 2 versions appolo-server-core and new `graphql-upload`. We need to use the resolutions in package json file as below:

```
"resolutions": {
  "graphql-upload": "^11.0.0"
},
```

2. Frontend side
Using the package `apollo-upload-client`
If we would like to use upload file feature we need to change `HttpLink` into `createUploadLink`.
Update inside applo configuration:

```
function createApolloClient(initialState = {}) {
  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link: ApolloLink.from([createUploadLink({uri: process.env.NEXT_PUBLIC_API_URL, credentials: 'include',})]),
    cache: new InMemoryCache().restore(initialState),
  });
}
```

3. Cloud sql admin API enabled
- https://console.developers.google.com/apis/library/sqladmin.googleapis.com