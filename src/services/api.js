// Login API call
export const loginUser = async (credentials) => {
  try {
    const response = await fetch("http://localhost:8000/api/login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    return await response.json();
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

// Signup API call
export const signupUser = async (userData) => {
  try {
    const response = await fetch("http://localhost:8000/api/signup/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    return await response.json();
  } catch (error) {
    console.error("Signup error:", error);
    throw error;
  }
};