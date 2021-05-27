/* eslint-disable no-param-reassign */
import { isObject } from 'lodash-es';

/**
 * 功能函数：处理函数
 *
 * 删除对象中
 * 值 = undefined
 *
 * @param {*} params
 * @returns
 */
const filterUndefined = params => {
    if (!params) {
        return {};
    }
    if (!isObject(params)) {
        return {};
    }
    const paramsEntries = Object.entries(params)
        .map(([key, value]) => {
            if (value === undefined) {
                return [];
            }
            return [key, value];
        })
        .filter(i => i.length !== 0);

    return Object.formEntries(paramsEntries);
};

/**
 * 拦截器：无效参数处理
 *
 * 处理掉 params / data 中无效的参数
 *
 * example: http://www.xxx.com?username=undefined&password=null
 * example: http://www.xxx.com
 */
const requestInterceptor = [
    config => {
        config.params = filterUndefined(config.params);
        config.data = filterUndefined(config.data);

        return config;
    },
    error => {
        throw error;
    }
];

export const filterParamsUndefinedInterceptor = { requestInterceptor };
