import axios from "axios";

const API_KEY = "AIzaSyC4seU_Xpicvs-OQKtH-7o63-w5zhwq3l0";

async function authenticate(mode, email, password) {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:${mode}?key=${API_KEY}`;

  try {
    const response = await axios.post(url, {
      email: email,
      password: password,
      returnSecureToken: true,
    });

    const token = response.data.idToken;

    return token;
  } catch (error) {
    throw new Error("Authentication failed: " + error.message);
  }
}

export function createUser(email, password) {
  return authenticate("signUp", email, password);
}

export function login(email, password) {
  return authenticate("signInWithPassword", email, password);
}
