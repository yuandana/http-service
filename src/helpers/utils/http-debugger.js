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
                        render: data => data?.response?.request?.responseURL
                    },
                    {
                        name: 'Request Method',
                        render: data => data?.response?.request?._method
                    },
                    {
                        name: 'Status Code',
                        render: data => {
                            const { status, statusText = 'OK' } =
                                data?.response?.request || {};
                            return `${status} ${statusText}`;
                        }
                    }
                ]
            },
            {
                name: 'Response Headers',
                renderChildren: data => {
                    const responseHeaders =
                        data?.response?.request?.responseHeaders;
                    if (responseHeaders) {
                        Object.keys(responseHeaders).forEach(key => {
                            console.log(`${key}: ${responseHeaders[key]}`);
                        });
                    }
                }
            },
            {
                name: 'Request Headers',
                renderChildren: data => {
                    const requestHeaders = data?.response?.request?._headers;
                    if (requestHeaders) {
                        Object.keys(requestHeaders).forEach(key => {
                            console.log(`${key}: ${requestHeaders[key]}`);
                        });
                    }
                }
            },
            {
                name: 'Query String Parameters',
                renderChildren: data => {
                    const requestParams = data?.request?.params;
                    if (requestParams) {
                        Object.keys(requestParams).forEach(key => {
                            console.log(`${key}: ${requestParams[key]}`);
                        });
                    }
                }
            }
        ]
    },
    {
        name: 'Preview',
        renderChildren: data => {
            console.log(data?.response?.data);
        }
    },
    {
        name: 'Response',
        renderChildren: data => {
            console.log(data?.response?.request?._response);
        }
    }
];

const renderConsole = (list, data) => {
    list.forEach(item => {
        const { name, children, render, renderChildren } = item;
        const result = render && typeof render === 'function' && render(data);
        const nextResult = result ? `: ${result}` : result;
        const nextName = `${name} ${nextResult || ''}`;
        if (children) {
            console.groupCollapsed(nextName);
            if (renderChildren && typeof renderChildren === 'function') {
                renderChildren(data);
            }
            renderConsole(children, data);
            console.groupEnd();
            return;
        }
        if (renderChildren && typeof renderChildren === 'function') {
            console.groupCollapsed(nextName);
            renderChildren(data);
            console.groupEnd();
            return;
        }
        console.log(nextName);
    });
};

const consoleLogHandler = data => {
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
