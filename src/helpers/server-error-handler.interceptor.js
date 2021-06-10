import axios from 'axios';

export const serverErrorHandlerInterceptor = {
    responseInterceptor: [
        response => {
            if (axios.isCancel(response)) {
                return response;
            }
            const { status } = response;
            switch (status) {
                case 200:
                    return response.data;
                default:
                    console.error(`服务报错，错误码：${status} ！`, response);
                    return false;
            }
        },
        error => {
            const isCancel = axios.isCancel(error);
            if (isCancel) {
                return error;
            }
            console.error(`服务报错！\n ${error}`);
            return error;
        }
    ]
};
