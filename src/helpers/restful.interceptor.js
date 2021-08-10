/* eslint-disable no-param-reassign */
/**
 * 拦截器：restful api params 处理
 *
 * example: params = { username: 'jack', id: '123456' }
 * example: url = http://www.xxx.com/:username/:id
 * example: url = http://www.xxx.com/jack/123456
 *
 * example: params = { username: 'jack', id: '123456' }
 * example: url = http://www.xxx.com
 * example: url = http://www.xxx.com?username=liudehua&id=123456
 *
 * @type {Array}
 */

const requestInterceptor = [
    config => {
        const { url, params, data } = config;
        const nextParams = {...params};
        let nextUrl = url;
        // 处理 url 中含 restful 参数的规则替换
        if (!url) {
            return config;
        }

        if (!url.includes('/:')) {
            return config;
        }

        if (nextParams) {
            Object.entries(nextParams).forEach(([key, value]) => {
                const reg = new RegExp(`/:${key}`, 'g');
                if (value !== undefined && url.search(reg) !== -1) {
                    nextUrl = nextUrl.replace(reg, `/${value}`);
                    delete nextParams[key];
                }
            });
            config.params = nextParams;
        }

        if (data) {
            Object.entries(data).forEach(([key, value]) => {
                const reg = new RegExp(`/:${key}`, 'g');
                if (value !== undefined && url.search(reg) !== -1) {
                    nextUrl = nextUrl.replace(reg, `/${value}`);
                }
            });
            config.data = data;
        }

        // 去除最后一个 :xxx
        // 满足 api/some/:id 的形势
        config.url = nextUrl.replace(/(\/:){1}(\w)+$/, '');

        return config;
    },
    error => {
        throw error;
    }
];

export const restfulInterceptor = { requestInterceptor };
