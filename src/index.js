import axios from 'axios';
import { isArray, isObject, uniqueId } from 'lodash-es';

const BASE_CONFIG = {
    withCredentials: false
};

const HTTP_SERVICE_CACHE = {};

const REQUEST_TYPE_MAPPER = {
    get: 'get',
    put: 'put',
    patch: 'patch',
    post: 'post',
    delete: 'delete',
    options: 'options',
    head: 'head',
    remove: 'delete'
};

const PARAMS_REQUEST_TYPE_LIST = ['get', 'remove', 'delete', 'head', 'options'];

const generateConfig = (config) => ({ ...BASE_CONFIG, ...config });

/**
 * 注册拦截器
 *
 * @param {Object} interceptor
 * interceptor = {
 *      requestInterceptor: [
 *          (config) => {},
 *          (error) => {}
 *      ],
 *      responseInterceptor: [
 *          (config) => {},
 *          (error) => {}
 *      ]
 * }
 */
export const registerInterceptor = (interceptor) => {
    if (isObject(interceptor)) {
        const { requestInterceptor, responseInterceptor } = interceptor;
        if (requestInterceptor) {
            axios.interceptors.request.use(...requestInterceptor);
        }
        if (responseInterceptor) {
            axios.interceptors.response.use(...responseInterceptor);
        }
    }
    if (isArray(interceptor)) {
        throw new Error(
            `HTTP SERVICE ERROR: The parameter of registerInterceptor must be an object containing 'requestInterceptor' or 'responseInterceptor'`
        );
    }
};

/**
 * 添加全局配置
 *
 * docs: https://axios-http.com/docs/req_config
 * @param {*} newConfig
 */
export const config = (newConfig) => {
    HTTP_SERVICE_CACHE.config = newConfig;
};

/**
 * 基础工厂方法
 *
 * 返回一个对象包含所有 axios 的请求类型对象，可以直接调用请求类型方法
 * eg: const someService = factory('http://xxx.com/api/v1/users');
 *     someService.get(params)
 *
 * params、body 统一作为请求类型方法的第一个参数来处理，根据restful规则自动放在 params/body
 *
 * 请求类型方法的第二个参数支持接收一个函数，在请求发出后会自动调用这个函数，
 * 并传入 abort 方法，通过 abort() 可以取消当前请求
 *
 * eg:  useEffect(() => {
 *          let abort;
 *          someService.get(params, (cancelFn) => { abort = cancelFn}, config);
 *          return () => {
 *              abort();
 *          }
 *      }, [])
 *
 * @param {*} url
 * @returns
 */
export const factory = (url) => {
    if (!url) {
        throw new Error(
            `HTTP SERVICE ERROR: You must give the http-service factory function a valid url;`
        );
    }

    const factoryEntries = Object.entries(REQUEST_TYPE_MAPPER).map(
        ([requestType, axiosMethod]) => {
            /**
             *
             * @param {Object} params
             * @param {Function} receivingCancelFn
             * @param {Object} config
             *
             * @returns service object
             */
            const requestFn = (params, receivingCancelFn, requestConfig) => {
                //
                const payloadObject = PARAMS_REQUEST_TYPE_LIST.includes(
                    requestType
                )
                    ? {
                          params
                      }
                    : {
                          data: params
                      };

                //
                const nextConfig = {
                    url,
                    method: axiosMethod,
                    ...payloadObject,
                    ...requestConfig,
                    uuid: uniqueId(),
                    timestamp: new Date().getTime(),
                    cancelToken: new axios.CancelToken((cancelFunction) => {
                        // An executor function receives a cancel function as a parameter
                        if (typeof receivingCancelFn === 'function') {
                            receivingCancelFn(cancelFunction);
                        }
                    })
                };

                const resultConfig = generateConfig(nextConfig);

                return axios.request(resultConfig);
            };

            return [requestType, requestFn];
        }
    );

    return Object.fromEntries(factoryEntries);
};


export * as helpers from './helpers';
