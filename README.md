# Api Engine

## Description

Api Engine is a TypeScript library designed to simplify API interactions in your projects. It provides a clean and efficient way to manage HTTP requests, making it easier to integrate APIs into your NodeJS applications.

## Download and Installation

To use Api Engine in your project, you can install it via npm. Run the following command:

"npm install api-engine" or "yarn add api-engine".

## Funtionalities

Api Engine offers the following key functionalities:

1. Configuration Options: Fine-tune Api Engine to fit your project's specific needs;
2. Initialization: Create an instance of the APIEngine class by providing essential API constants, such as endpoints, request configurations, and global parameters;
3. HTTP Requests: Utilize the call method to make GET, POST, PUT, and DELETE requests. The method supports various parameters and configurations for flexible API integration;
4. Global Params: Provide global configuration for all endpoints parameters. This allow you to not rewrite the same configuration for every endpoint;
5. Retry Mechanism: Implement automatic retries based on configurable conditions, enabling robust handling of transient errors;
6. Interceptor Support: Intercept and manipulate both request and response dynamically using the interceptor feature;
7. Stack Trace: track all api calls with request and response data;
8. Promise-based: Utilize promises for asynchronous handling of API calls.

## Configuration Options

Creating an apiConstants configuration file involves defining the various parameters for your API endpoints, as well as any global parameters that should apply to all endpoints. Here's a step-by-step guide on how to create an apiConstants configuration file:

### 1. Create a TypeScript File:

-   Start by creating a new TypeScript file. You can name it something like apiConstants.ts.

### 2. Import Required Types and Modules:

-   Import the necessary types and modules from your API library or external dependencies. For example:

```typescript
// Import necessary types and modules
import { ApiConstants, ApiEndpointType } from 'api-engine';
```

### 3. Define Global Parameters:

-   Specify global parameters that will apply to all endpoints. This can include the base URL, default headers, and global retry settings. For example:

```typescript
const apiConstants: ApiConstants = {
    baseUrl: 'https://api.example.com',
    globalParams: {
        request: {
            headers: {
                Authorization: 'Bearer YOUR_ACCESS_TOKEN',
                'Content-Type': 'application/json',
            },
        },
        retry: 3,
        retryCondition: [500, 502],
        stackTraceLogExtraParams: {
            extraParam: 'extraParam',
        }, // Include extra parameters in stack traces
        requestInterceptor: (requestConfig) => {
            // Your custom logic for modifying request configuration globally
            return requestConfig;
        },
        responseInterceptor: (response) => {
            // Your custom logic for handling responses globally
            return response;
        },
    },
    endpoints: {
        // Define your endpoints here
    },
};

export default apiConstants;
```

### 4. Define Endpoint Configurations:

-   Define individual endpoint configurations within the endpoints object. Specify the path, HTTP method, and any endpoint-specific parameters. For example:

```typescript
const apiConstants: ApiConstants = {
    baseUrl: 'https://api.example.com',
    globalParams: {
        // ... global parameters
    },
    endpoints: {
        getResource: {
            path: '/resources/{id}',
            request: {
                method: 'GET',
            },
            retry: 1,
            // ... other endpoint parameters
        },
        createResource: {
            path: '/resources',
            request: {
                method: 'POST',
            },
            // ... other endpoint parameters
        },
        // ... other endpoints
    },
};

export default apiConstants;
```

### 5. Export Configuration:

-   Export the configuration object so that it can be imported and used in your application:

```typescript
export default apiConstants;
```

### 6. Customize as Needed:

-   Customize the configuration based on your specific API requirements. You can add additional parameters like headers, retryCondition, statusCodesActions, errorMessages, etc., to fine-tune the behavior of individual endpoints.

### 7. Use in Your Application:

-   Import and use the apiConstants configuration in your application where you interact with the API:

```typescript
import apiConstants from './apiConstants.ts';

// Use the configuration in your API calls
// ...
```

By following these steps, you can create a flexible and organized apiConstants configuration file that serves as the foundation for managing your API interactions. Adjust the parameters based on the specific needs of your project and the capabilities provided by your chosen API library or framework.

## Initilization

To initialize the `APIEngine` class with the `apiConstants` configuration, you can follow these steps. Assuming you have the `apiConstants` configuration file and the `APIEngine` class:

### 1. import APIEngine class and apiConstants:

Import the APIEngine class and the apiConstants configuration at the beginning of your file where you plan to use the API.

```typescript
import { APIEngine } from 'api-engine';
import apiConstants from './apiConstants'; // Update the path as needed
```

### 2. Create an Instance of `APIEngine` Class:

Create an instance of the `APIEngine` class by passing the `apiConstants` configuration to the constructor.

```typescript
const apiInstance = new APIEngine(apiConstants);
```

### 3. Use the `apiInstance`:

You can now use the `apiInstance` to make API calls and leverage the functionalities provided by the `APIEngine` class.

```typescript
// Example: Make a GET request to the "getResource" endpoint
const getResourceResponse = await apiInstance.call('getResource', { pathQueryParameters: [{ name: 'id', value: '123' }] });

console.log('Response:', getResourceResponse);
```

Adjust the method calls and parameters based on your specific API requirements and the functionalities provided by your `APIEngine` class.

Here's how your code might look in a broader context:

```typescript
import { APIEngine } from 'api-engine';
import apiConstants from './apiConstants'; // Update the path as needed

const apiInstance = new APIEngine(apiConstants);

// Example: Make a GET request to the "getResource" endpoint
const getResourceResponse = await apiInstance.call('getResource', { pathQueryParameters: [{ name: 'id', value: '123' }] });

console.log('Response:', getResourceResponse);
```

Make sure that your `APIEngine` class and the `apiConstants` configuration are appropriately structured and compatible for this initialization process. Adjust paths and import statements based on your project's file structure.

## Get Api Types

The `getApiTypes` method in your `APIEngine` class returns an object that represents the available endpoint types. Each property of the object corresponds to an endpoint type, and the value is the same as the property name. This method is useful for obtaining a list of available endpoint types dynamically.

Here's how you can use the `getApiTypes` method in your code:

Assuming you have an instance of the `APIEngine` class:

```typescript
import { APIEngine } from 'api-engine';
import apiConstantsTs from './apiConstantsTs'; // Update the path as needed

const apiInstance = new API(apiConstantsTs);

// Use the getApiTypes method to get the available endpoint types
const apiTypes = apiInstance.getApiTypes();

// Now apiTypes is an object where keys are endpoint types
// and values are the same as the keys
console.log('Available Endpoint Types:', apiTypes);
```

In this example, `apiTypes` will be an object like:

```typescript
{
    getResource: 'getResource',
    createResource: 'createResource',
    // ... other endpoint types
}
```

You can then use this information dynamically in your application, for example, to generate UI components or to validate user input for endpoint types.

Please note that the `getApiTypes` method doesn't take any parameters because it relies on the endpoint types defined in your `apiConstants` configuration. If you add or remove endpoint types from your configuration, the `getApiTypes` method will reflect those changes dynamically.

## Global configurations

In your `APIEngine` class, `globalParams` is a set of configuration parameters that are applied globally to all endpoints unless overridden at the endpoint level. It allows you to define default settings that should be shared across multiple API calls. Here's how it works and how you can create it:

### How `globalParams` Works:

### 1. Request:

-   Request defined in `globalParams.request` will be included in every request made by any endpoint unless overridden at the endpoint level. The params will be merged with the endpoint level params. If there's a conflict (i.e., the same header is defined in both global and endpoint parameters), the endpoint-specific header will override the global one.

### 2. Retry Settings:

-   Retry settings (except for the `retry` parameter) merge with the endpoint level retry settings. If an endpoint specifies its own retry settings, they will merge with the global retry settings, combining `retryCondition`. For the `retry` parameter instead, the endpoint level value will always overwrite the global level value.

### 3. Stack Trace Extra Params:

-   Stack trace extra params defined in `globalParams.stackTraceExtraParams` will merge with the endpoint level `stackTraceExtraParams` parameter;

### 4. Request Interceptor:

-   Request interceptor defined in `globalParams.requestInterceptor` will merge with the endpoint level `requestInterceptor` parameter. Both the methods will be extecuted. The endpoint level method will be executed at least;

### 5. Response Interceptor:

-   Response interceptor defined in `globalParams.responseInterceptor` will merge with the endpoint level `responseInterceptor` parameter. Both the methods will be extecuted. The endpoint level method will be executed at least.

### How to Create `globalParams`:

In your `apiConstants` configuration file, you can define `globalParams` by providing default values for common parameters that should apply to all endpoints:

```typescript
const apiConstants: ApiConstants = {
    baseUrl: 'https://api.example.com',
    globalParams: {
        request: {
            headers: {
                Authorization: 'Bearer YOUR_ACCESS_TOKEN',
                'Content-Type': 'application/json',
            },
        },
        retry: 3,
        retryCondition: [500, 502],
        stackTraceLogExtraParams: {
            extraParam: 'extraParam',
        },
        requestInterceptor: (requestConfig) => {
            return requestConfig;
        },
        responseInterceptor: (response) => {
            return response;
        },
    },
    endpoints: {
        // Define your endpoints here
    },
};

export default apiConstants;
```

In this example:

-   All requests will include an `Authorization` header with a bearer token and a `Content-Type` header with the value `application/json` unless overridden at the endpoint level;

-   All requests will have a maximum of 3 retries, and retries will be attempted for HTTP status codes 500 and 502 unless overridden at the endpoint level;

-   All requests will execute the method defined in `requestInterceptor`, merged with the endpoint level config, before the call is made;

-   All requests will execute the method defined in `responseInterceptor`, merged with the endpoint level config, before the call is made.

### Overriding `globalParams` at the Endpoint Level:

You can override global parameters at the endpoint level by providing endpoint-specific values in the `baseUrl`, `request`, `retry`, `retryCondition`, `stackTraceLogExtraParams`, `requestInterceptor` and `responseInterceptor` properties:

```typescript
const apiConstants: ApiConstants = {
    baseUrl: 'https://api.example.com',
    globalParams: {
        request: {
            headers: {
                Authorization: 'Bearer YOUR_ACCESS_TOKEN',
                'Content-Type': 'application/json',
            },
        },
        retry: 3,
        retryCondition: [500, 502],
        stackTraceLogExtraParams: {
            extraParam: 'extraParam',
        },
        requestInterceptor: (requestConfig) => {
            return requestConfig;
        },
        responseInterceptor: (response) => {
            return response;
        },
    },
    endpoints: {
        getResource: {
            path: '/posts/{id}',
            request: {
                method: 'GET', // Merges with global header
                headers: {
                    'Content-Type': 'application/json', // Overrides global header
                    'Custom-Header': 'Custom-Value', // Merges with global header
                },
            },
            retry: 1, // Overrides global retry for this endpoint
            retryCondition: [400], // Merges global retryCondition for this endpoint
        },
        createResource: {
            path: '/posts',
            request: {
                method: 'POST',
            },
            // ... other endpoint parameters
            stackTraceLogExtraParams: {
                extraParam: 'extraParam', // Merges with global stackTraceLogExtraParams
            },
            requestInterceptor: (requestConfig) => {
                // Will be executed after global requestInterceptor
                return requestConfig;
            },
            responseInterceptor: (response) => {
                // Will be executed after global responseInterceptor
                return response;
            },
        },
        // ... other endpoints
    },
};

export default apiConstants;
```

This flexibility allows you to define default settings globally while providing the option to customize settings for specific endpoints as needed.

### Ignore `globalParams` at the endpoint level:

In the configuration file you can ignore global parameters for specific endpoints. This can be achieved through the ignoreGlobalParams property in your endpoint. When an endpoint is configured to ignore certain global parameters, it means that the values for those parameters won't be merged or overridden from the global settings into the endpoint-specific settings. Instead, the endpoint will use its own specified values for those parameters.

Here's how to use this feature in your `apiConstants` configuration file:

#### Configuration Example:

```typescript
const apiConstants: ApiConstants = {
    baseUrl: 'https://api.example.com',
    globalParams: {
        request: {
            headers: {
                Authorization: 'Bearer YOUR_ACCESS_TOKEN',
                'Content-Type': 'application/json',
            },
        },
        retry: 3,
        retryCondition: [500, 502],
    },
    endpoints: {
        getResource: {
            path: '/posts/{id}',
            request: {
                method: 'GET',
                headers: {
                    'Custom-Header': 'Custom-Value',
                },
            },
            // Ignore global retry settings for this endpoint
            ignoreGlobalParams: ['retry'],
        },
        createResource: {
            path: '/posts',
            request: {
                method: 'POST',
            },
            // Use global retry settings for this endpoint
        },
        // ... other endpoints
    },
};

export default apiConstants;
```

## Configure endpoints

To interact with different API endpoints, you can configure each endpoint in the `endpoints` property of your `apiConstants` configuration file. Each endpoint is defined by a key-value pair, where the key is the endpoint identifier, and the value is an object containing the configuration details.

### Example Configuration:

```typescript
const apiConstants: ApiConstants = {
    baseUrl: 'https://api.example.com',
    globalParams: {
        // Global parameters (request, retry, etc.)
    },
    endpoints: {
        getResource: {
            path: '/posts/{id}', // Relative path, supports path parameters like {id}
            request: {
                method: 'GET', // HTTP method (GET, POST, etc.)
                headers: {
                    'Custom-Header': 'Custom-Value',
                },
            },
            retry: 3, // Number of retry attempts
            retryCondition: [500, 502], // Retry conditions (HTTP status codes)
            ignoreGlobalParams: ['retry'], // Ignore specific global parameters for this endpoint
            stackTraceExtraParams: {
                // Will set extra parameters to stack trace logs
                extraParam: 'extraParam',
            },
            requestInterceptor: (requestConfig) => {
                // Will modify the endpoint configuration before the API is called
                return requestConfig;
            },
            responseInterceptor: (response) => {
                // Will handle the API response
                return response;
            },
        },
        createResource: {
            path: '/posts',
            request: {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: 'foo',
                    body: 'bar',
                    userId: 1,
                }),
            },
            // ... other endpoint parameters
        },
        otherEndpoint: {
            baseUrl: 'api.custom.com', // Will override global baseUrl
            path: '/posts',
            request: {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            },
            // ... other endpoint parameters
        },
        // ... other endpoints
    },
};

export default apiConstants;
```

### Configurable Endpoint Parameters:

-   **baseUrl**: Ovverride the global baseUrl;

-   **path**: Relative path of the endpoint. Supports path parameters like `{id}`;

-   **request**: Configuration for the HTTP request, including method, headers, and body;

-   **retry**: Number of retry attempts for the endpoint;

-   **retryCondition**: Retry conditions based on HTTP status codes;

-   **ignoreGlobalParams**: Ignore specific global parameters for this endpoint;

-   **stackTraceExtraParams**: Adds extra parameters to stack trace logs;

-   **requestInterceptor**: Modifies the endpoint request configuration;

-   **responseInterceptor**: Handle the response data.

### Using Endpoints in Your Application:

After configuring your endpoints, you can use the `call` method of your `APIEngine` class to make API calls using these endpoint configurations. The `call` method takes two parameters:

Parameters:

-   **type (string)**: The identifier of the endpoint you want to call.

-   **parameters (ApiParameters | undefined)**: (Optional) Additional parameters for the API call, such as path query parameters, headers, and request body.

```typescript
// Assuming you have initialized your API instance as apiInstance
const getResourceResponse = await apiInstance.call('getResource', { pathQueryParameters: [{ name: 'id', value: '123' }] });
console.log('getResource Response:', getResourceResponse);

const createResourceResponse = await apiInstance.call('createResource');
console.log('createResource Response:', createResourceResponse);
```

### `pathQueryParameters` Parameter:

-   **Type**: `Parameter[]`;
-   **Description**: An array of objects representing path and query parameters to be included in the API call's URL.

#### `PathQueryParameters` Object:

-   **Type**: `{ name: string, value: string }`;
-   **Description**: An object representing a path or query parameter.
    -   `name`: The name of the parameter (e.g., `{id}` for a path parameter or `userId` for a query parameter);
    -   `value`: The value of the parameter.

#### Example Usage:

```typescript
const apiParameters: Parameter[] = {
    pathQueryParameters: [
        { name: 'id', value: '123' }, // Path parameter
        { name: 'userId', value: '456' }, // Query parameter
    ],
    // ... other parameters
};

const getResourceResponse = await apiInstance.call('getResource', apiParameters);
```

In this example:

-   The `pathQueryParameters` array includes two objects:

    -   `{ name: 'id', value: '123' }`: A path parameter with the name `id` and value `123`.
    -   `{ name: 'userId', value: '456' }`: A query parameter with the name `userId` and value `456`.

These parameters are then used to construct the URL for the API call, with path parameters replacing placeholders in the endpoint's path, and query parameters appended to the URL.

### Per-param encoding control

Each element of `pathQueryParameters` can specify an optional `encode` flag to control URL encoding. The flag defaults to `true` for backward compatibility. When `encode` is set to `false`, the value is injected into the path without applying `encodeURIComponent`. 

#### Example

```typescript
// Previous behaviour (default encoding)
path: '/api/search/products{queryParams}'
serviceParams: {
  pathQueryParameters: [
    { name: 'queryParams', value: '?a=1&b=2' } // will be URL-encoded
  ]
}

// With encode set to false
path: '/api/search/products{queryParams}'
serviceParams: {
  pathQueryParameters: [
    { name: 'queryParams', value: '?a=1&b=2', encode: false } // raw injection
  ]
}
```

Empty, undefined or null values remove the related placeholder and the library normalizes the resulting URL to avoid leftover separators. When `encode` is `false` and the value is an array, it will be serialized using `Array.prototype.join(',')` before being injected.

## Stack Trace Functionality

The stack trace functionality offers a comprehensive logging mechanism for API calls, capturing essential details throughout the request-response lifecycle. This functionality creates a detailed log entry for each API interaction.

### Logged informations

This functionality constructs a structured log entry, encompassing various aspects of an API call:

-   **Timing Information**: Captures the start and end timestamps of the API call;
-   **Request Details**: Includes the request URL, headers, body ecc;
-   **Response Details**: Encompasses response headers, body, HTTP status code ecc;
-   **Error Handling**: Records any errors that occur during the API call;
-   **Extra Parameters**: Allows you to include additional context-specific information.

#### Trace data model

```typescript
[
    {
        startTimestamp: string, // The timestamp when the API call started
        endTimestamp: string, // The timestamp when the API call ended
        requestUrl: string, // The URL of the API request
        requestHeaders: HeadersInit, // Headers sent in the API request
        responseHeaders: Headers, // Headers received in the API response
        requestBody: BodyInit, // The body of the API request
        responseBody: BodyInit, // The body of the API response
        responseStatusCode: number, // The HTTP status code of the API response
        errorMessage: string | unknown, // Any error that occurred during the API call
        extraProperties: object, // Extra parameters specific to the stack trace log, as provided by stackTraceLogExtraParams
    },
];
```

### Usage

```typescript
// Initialize the API class
const api = new API(apiConstants);

// Perform API calls
await api.call('getResource');
await api.call('createResource', {
    /* parameters */
});

// Retrieve the stack trace log
const stackTraceLog = api.getStackTraceLog();

// Utilize log entries for analysis or debugging
console.log(stackTraceLog);
```

Or you can also use a callback to save the stack trace logs:
```typescript
// Define the stack trace log array
const stackTraceLog: StackTrace[] = [];

// Define the stackTraceCallback
const stackTraceCallback = (_stackTraceLog: StackTrace) => {
    stackTraceLog.push(_stackTraceLog);
}

// Initialize the API class
const api = new API(apiConstants, stackTraceCallback);

// Perform API calls
await api.call('getResource');
await api.call('createResource', {
    /* parameters */
});

// Utilize log entries for analysis or debugging
console.log(stackTraceLog);
```

By leveraging this stack trace functionality, you can effectively trace the execution flow of API calls, examine request-response details, and diagnose errors, enhancing the overall visibility and debuggability of the API integration process.

## Contributing

Via pull request to this repository.

## To-Do (upcoming changes)

None

## Licensing

[MIT](https://github.com/3sydev/api_engine?tab=MIT-1-ov-file)
