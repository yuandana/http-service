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
        return params;
    }
    if (!isObject(params)) {
        return params;
    }
    const paramsEntries = Object.entries(params)
        .map(([key, value]) => {
            if (value === undefined) {
                return null;
            }
            return [key, value];
        })
        .filter(Boolean);

    return Object.fromEntries(paramsEntries)
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
        if(config.params){
            config.params = filterUndefined(config.params);
        }
        if(config.data){
            config.data = filterUndefined(config.data);
        }

        return config;
    },
    error => {
        throw error;
    }
];

export const filterParamsUndefinedInterceptor = { requestInterceptor };
