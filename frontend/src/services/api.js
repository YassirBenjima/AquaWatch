import axios from 'axios';

const API_URL = 'http://localhost:3005/api';

export const login = async (email, password) => {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    return response.data;
};

export const register = async (email, password) => {
    const response = await axios.post(`${API_URL}/register`, { email, password });
    return response.data;
};

export const getUser = async (email) => {
    const response = await axios.get(`${API_URL}/user/${email}`);
    return response.data;
};

export const updateSettings = async (email, notifications_enabled) => {
    const response = await axios.put(`${API_URL}/user/${email}`, { notifications_enabled });
    return response.data;
};
