import { cloneDeep } from 'lodash-es';

const cacheObject = {};

const logObject = [
    {
        name: 'Headers',
        children: [
            {
                name: 'General',
                children: [
                    {
                        name: 'Request URL',
                        nameRender: (data) => {
                            const responseURL =
                                data?.response?.request?.responseURL;
                            if (responseURL) {
                                return `Request URL ${responseURL}`;
                            }
                            return 'Request URL';
                        },
                        render: (data) => data?.response?.request?.responseURL
                    },
                    {
                        name: 'Request Method',
                        render: (data) => data?.response?.request?._method,
                        nameRender: (data) => {
                            const method = data?.response?.request?._method;
                            if (method) {
                                return `Request Method'${method}`;
                            }
                            return 'Request Method';
                        }
                    },
                    {
                        name: 'Status Code',
                        nameRender: (data) => {
                            const { status, statusText = 'OK' } =
                                data?.response?.request || {};
                            if (status) {
                                return `Status Code ${status} ${statusText}`;
                            }
                            return 'Status Code';
                        }
                    }
                ]
            },
            {
                name: 'Request Headers',
                render: (data) => {
                    const requestHeaders = data?.response?.request?._headers;
                    if (requestHeaders) {
                        Object.keys(requestHeaders).forEach((key) => {
                            console.log(`${key}: ${requestHeaders[key]}`);
                        });
                    }
                }
            },
            {
                name: 'Query String Parameters',
                render: (data) => {
                    const requestParams = data?.request?.params;
                    if (requestParams) {
                        Object.keys(requestParams).forEach((key) => {
                            console.log(`${key}: ${requestParams[key]}`);
                        });
                    }
                }
            },
            {
                name: 'Response Headers',
                render: (data) => {
                    const responseHeaders =
                        data?.response?.request?.responseHeaders;
                    if (responseHeaders) {
                        Object.keys(responseHeaders).forEach((key) => {
                            console.log(`${key}: ${responseHeaders[key]}`);
                        });
                    }
                }
            }
        ]
    },
    {
        name: 'Request Payload',
        nameRender: (data) => {
            const requestData = data?.request?.data;
            if (requestData) {
                return 'Request Payload';
            }
            const requestParams = data?.request?.params;
            if (requestParams) {
                return 'Query String Parameters';
            }
        },
        render: (data) => {
            const requestData = data?.request?.data;
            if (requestData) {
                console.log(requestData);
                return;
            }
            const requestParams = data?.request?.params;
            if (requestParams) {
                console.log(requestParams);
            }
        }
    },
    {
        name: 'Request Source',
        render: (data) => {
            const requestData = data?.request?.data;
            if (requestData) {
                console.log(JSON.stringify(requestData));
                return;
            }
            const responseURL = data?.response?.request?.responseURL;
            const requestParams = data?.request?.params;
            if (requestParams) {
                console.log(responseURL);
            }
        }
    },
    {
        name: 'Response Preview',
        render: (data) => {
            console.log(data?.response?.data);
        }
    },
    {
        name: 'Response',
        render: (data) => {
            console.log(data?.response?.request?._response);
        }
    }
];

const renderConsole = (list, data) => {
    list.forEach((item) => {
        const { name, children, nameRender, render } = item;
        let nextName = name;
        if (typeof nameRender === 'function') {
            nextName = nameRender(data);
        }
        if (children) {
            console.groupCollapsed(nextName);
            if (render && typeof render === 'function') {
                render(data);
            }
            renderConsole(children, data);
            console.groupEnd();
            return;
        }
        if (render && typeof render === 'function') {
            console.groupCollapsed(nextName);
            render(data);
            console.groupEnd();
            return;
        }
        console.log(nextName);
    });
};

const consoleLogHandler = (data) => {
    const { request, response } = data;
    const castTime = new Date().getTime() - request.timestamp;
    const method = response.request._method;
    const { responseURL } = response.request;
    const isHttps = responseURL.indexOf('https') !== -1;
    console.groupCollapsed(
        `%c [${
            isHttps ? 'HTTPS' : 'HTTP'
        }][${method}][TIME:${castTime}] \n${responseURL}`,
        'color:white;background:dodgerblue;'
    );
    renderConsole(logObject, data);
    console.groupEnd();
};

export default (key, config) => {
    if (process.env.NODE_ENV === 'production') {
        return;
    }
    if (!cacheObject[key]) {
        cacheObject[key] = {
            request: cloneDeep(config)
        };
    } else {
        cacheObject[key] = {
            ...cacheObject[key],
            response: cloneDeep(config)
        };
        // 输出完整log
        consoleLogHandler(cacheObject[key]);
        delete cacheObject[key];
        // 删除缓存
    }
};
