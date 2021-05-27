/**
 * 创建一个 Authorization request 拦截器
 * 传入一个 getToken方法并 return token;
 * 函数将自动在所有请求的 header.Authorization = token;
 *
 * @param {*} getToken
 * @returns {HttpServiceInterceptor}
 */
export const createAuthorizationInterceptor = getToken => {
    if (typeof getToken !== 'function') {
        throw new Error(
            'HTTP SERVICE ERROR: The create authorization interceptor method requires a function as a parameter'
        );
    }

    return {
        requestInterceptor: [
            async config => {
                const token = await getToken();
                if (token) {
                    // eslint-disable-next-line no-param-reassign
                    config.headers.Authorization = token;
                }
                return config;
            },
            error => {
                throw error;
            }
        ]
    };
};
