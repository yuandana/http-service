import httpDebuggerInterceptors from './http-debugger';

/**
 *
 */
const requestInterceptor = [
    config => {
        httpDebuggerInterceptors(config.uuid, config);
        return config;
    },
    error => {
        throw error;
    }
];

/**
 *
 */
const responseInterceptor = [
    response => {
        httpDebuggerInterceptors(response.config.uuid, response);
        return response;
    },
    error => {
        throw error;
    }
];

/**
 * 通过 console 美化的方式在控制台打印每次请求的 request & response
 * 可以使用在并没有合适的调试请求的工具可用时，比如 RN 环境
 */
export const debuggerInterceptor = { requestInterceptor, responseInterceptor };
