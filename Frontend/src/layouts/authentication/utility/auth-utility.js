import axios from 'axios'

const endpoint = `${process.env.REACT_APP_API_BASE_URL}/Authentication/getIdentity`;

async function isAuthenticated () {
    let params = prepareAuthHeader();

    if (!params.headers || !params.headers.Authorization) {
        return false;
    }

    try {
        const response = await axios.get(endpoint, params);

        if (response.status !== 200) {
            localStorage.removeItem('token');
            return false;
        }

        return response.data.identity;
    } catch (error) {
        localStorage.removeItem('token');
        return false;
    }
}

async function findUser () {
    let params = prepareAuthHeader();

    if (!params.headers || !params.headers.Authorization) {
        return null;
    }

    params.params = {
        loadUser: true
    }

    try {
        const response = await axios.get(endpoint, params);

        if (response.status !== 200) {            
            return null;
        }

        return response.data.user;
    } catch (error) {        
        return null;
    }    
}

function prepareAuthHeader () {
    let params = {};
    let token = localStorage.getItem('token')

    if (token) {
        params['headers'] = {
            'Authorization': `Bearer ${token}`
        };
    }

    return params;
}

export {
    isAuthenticated,
    findUser,
    prepareAuthHeader
}