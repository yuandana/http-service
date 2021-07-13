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
                    console.error(`http status error ，code：${status} ！`, response);
                    return false;
            }
        },
        error => {
            const isCancel = axios.isCancel(error);
            if (isCancel) {
                return error;
            }
            console.error(`axios error \n`, error);
            return error;
        }
    ]
};
