# Api Engine

## Description

REST API engine to simplify REST API integration in NodeJS applications. This library provides simple and fast REST API configurations for the most used data managing functionalities.

## Download and Installation

"npm install api-engine" or "yarn add api-engine".

## Funtionalities

-   Configuration;
-   Definition of base url;
-   Global configurations;
-   Definition of endpoints;
-   Retry logics;
-   Ignore global params;
-   Actions on status codes;
-   Error messages;

### Configuration

### Definition of base url

The first step is to configure the baseUrl, so every endpoint known the base url to use.

To configure the baseUrl you need to set it on the apiConstants object as a string.

Example:

```
const apiConstantsTs: ApiConstantsType = {
    baseUrl: 'https://jsonplaceholder.typicode.com',
    endpoints: {
        getResources: {
            path: '/posts',
            request: {
                method: 'GET',
            },
            retry: 0,
            retryCondition: [],
        },
    },
};
```

### Global configurations

### Definition of endpoints

### Retry logics

### Ignore global params

### Actions on status codes

### Error messages

## Contributing

Via pull request to this repository.

## To-Do (upcoming changes)

None

## Licensing
