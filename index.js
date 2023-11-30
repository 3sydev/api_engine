import API from './src/API';

export default class APIInterface {
    constructor(apiConstants) {
        this.apiConstants = apiConstants;
    }

    api = new API(this.apiConstants);

    call = (type, parameters) => {
        return new Promise(async (resolve, reject) => {
            try {
                const res = await this.api.call(type, parameters);
                resolve(res);
            } catch (error) {
                console.error(error);
                reject(error);
            }
        });
    };
}
