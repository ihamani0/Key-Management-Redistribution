import axios from "axios";

export const loginAPI = async (credentials) => {
  try {
    const response = await axios.post(
      "http://localhost:5000/api/auth/login",
      credentials,
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Login failed";
    throw new Error(errorMessage);
  }
};

export const checkAuthAPI = async () => {
  try {
    const response = await axios.get(
      "http://localhost:5000/api/auth/checkAuth",
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Login failed";
    throw new Error(errorMessage);
  }
};

export const logoutAPI = async () => {
  try {
    const response = await axios.get(
      "http://localhost:5000/api/auth/logout",
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Login failed";
    throw new Error(errorMessage);
  }
};