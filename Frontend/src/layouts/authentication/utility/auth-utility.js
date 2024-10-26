import axios from 'axios'


async function isAuthenticated() {
    const token = localStorage.getItem('token');

    if (!token) {
        return false;
    }

    let endpoint = `${process.env.REACT_APP_API_BASE_URL}/Authentication/getIdentity`;
    let params = {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };

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


export {
    isAuthenticated
}