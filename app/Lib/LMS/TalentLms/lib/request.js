const axios = require('axios');
const CustomException = use('App/Exceptions/CustomException')

const formUrlEncoded = (obj) => {
  return Object.keys(obj).reduce((p, c) => `${p}&${c}=${encodeURIComponent(obj[c])}`, '');
}

module.exports = async function (method, path, data, host=null) {
    if (!host){
      host = this.hostname
    }
    const url = `https://${host}/api/v1/${path}`
    const options = {
        method,
        url,
        data: data ? formUrlEncoded(data) : undefined,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${this.token}`
        },
        auth: {
            username: this.token
        }
    };

    return axios(options).then(response => {
        return response.data;
    }).catch(error => {
      if(error.response && error.response.data)
        throw new CustomException(error.response.data.error.message , 400)
      throw new CustomException(`${error.message} \n url ${url} \n ${((data) ? data : '')}`, 400)
      // return {
      //     error: error.response && error.response.data ? error.response.data.error : {
      //         message: `${error.message} \n url ${url} \n ${((data) ? data : '')}`,
      //         stack: error.stack
      //     }
      // }
    })
}
