const FILE_RESPONSE_CONTENT_TYPES = [
    // csv 格式
    'application/csv',
    // vnd.ms-excel
    'application/vnd.ms-excel',
    // vnd.openxmlformats
    'application/vnd.openxmlformats',
    // xml
    'application/xml',
    // 二进制流数据
    'application/octet-stream'
    // // Word文档格式
    // 'application/msword',
    // // pdf格式
    // 'application/pdf'
];

const FILE_RESPONSE_DISPOSITIONS = ['attachment'];

/**
 * 判断返回的请求是否为文件下载
 *
 * @param {*} response
 * @returns
 */
const isFileDownLoad = response => {
    const { headers } = response;
    const contentType = headers && headers['content-type'];
    const disposition = headers && headers['content-disposition'];

    return [
        FILE_RESPONSE_CONTENT_TYPES.find(type => contentType.includes(type)),
        FILE_RESPONSE_DISPOSITIONS.find(type => disposition.includes(type))
    ].find(i => !!i);
};

/**
 * 根据 response.header.content-disposition 解析文件 filename
 * @param {*} response
 * @returns
 */
const getFileName = response => {
    const { headers } = response;
    const disposition = headers && headers['content-disposition'];
    const result = disposition?.match(/filename\s*=\s*"([^"]*)"/) || [];

    return result[1];
};

const responseInterceptor = [
    response => {
        const isFile = isFileDownLoad(response);
        if (!isFile) {
            return response;
        }
        try {
            let fileName = getFileName(response);
            const link = document.createElement('a');
            let blob;
            if (isFile === 'application/csv') {
                blob = new Blob([`\ufeff${response.data}`], {
                    type: 'text/csv'
                });
                fileName = fileName || `${new Date().getTime().toString()}.csv`;
            }
            if (
                isFile === 'application/vnd.ms-excel' ||
                isFile === 'application/vnd.openxmlformats'
            ) {
                blob = new Blob([response.data], {
                    type: 'application/vnd.ms-excel'
                });
                fileName = fileName || `${new Date().getTime().toString()}.xls`;
            }
            if (blob) {
                link.setAttribute('href', URL.createObjectURL(blob));
                link.setAttribute('download', fileName);
                link.click();
            }
        } catch (err) {
            // Errors are thrown for bad options, or if the data is empty and no fields are provided.
            // Be sure to provide fields if it is possible that your data array will be empty.
            // console.error(err);
        }
        return response;
    },
    error => error
];

/**
 * response 返回 excel 文件时自动处理成下载
 * 适用与浏览器环境
 *
 * eg:  SomeService.get('http://download-file-url');
 * 将自动提示你保存文件
 */
export const fileStreamInterceptor = { responseInterceptor };
