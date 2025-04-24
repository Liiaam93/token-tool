import axios, { AxiosError } from 'axios';

// Define the structure of the error response that the API returns
interface ApiErrorResponse {
  error: {
    message: string;
    errorCode: string;
    statusCode: number;
  };
}

interface UserDetails {
  first_name: string;
  // Add other fields you expect here, for example:
  last_name: string;
  email: string;
  // You can also add any other fields that the userResponse might contain
}

interface UserResponse {
  userDetails: UserDetails;
}

export const login = async (email: string, password: string) => {
  const loginUrl = 'https://m2hvqe7ta1.execute-api.eu-west-2.amazonaws.com/prod/user/login';
  const logoutUrl = 'https://m2hvqe7ta1.execute-api.eu-west-2.amazonaws.com/prod/user/logout';

  const payload = {
    email,
    password,
    productCode: 'fp',
  };

  try {
    // Step 1: Try logging in
    const loginResponse = await axios.post(loginUrl, payload);

    // If login is successful, return the tokens
    const { AccessToken, IdToken } = loginResponse.data;
    const bearerToken = `Bearer ${AccessToken}-id-token-${IdToken}`;

    // Store the token in local storage or cookie
    localStorage.setItem('bearerToken', bearerToken);

    return bearerToken;
  } catch (loginError) {
    // Type the loginError as AxiosError and cast the response data to ApiErrorResponse
    const error = loginError as AxiosError<ApiErrorResponse>;

    if (error.response?.data?.error?.message === 'User already has an active session') {
      // Step 2: Logout from all sessions
      const logoutPayload = {
        email,
        logout: 'hard',
        productCode: 'fp',
      };

      await axios.post(logoutUrl, logoutPayload);

      // Retry login after logout
      const retryLoginResponse = await axios.post(loginUrl, payload);
      const { AccessToken, IdToken } = retryLoginResponse.data;
      const bearerToken = `Bearer ${AccessToken}-id-token-${IdToken}`;

      // Store the token
      localStorage.setItem('bearerToken', bearerToken);

      console.log(bearerToken)

      const userResponse = await axios.get<UserResponse>(`https://m2hvqe7ta1.execute-api.eu-west-2.amazonaws.com/prod/user/email/${email}/fp`, {
        headers: {
          Authorization: bearerToken,
        },
      });

      console.log(userResponse)
      localStorage.setItem('PortalUser', userResponse.data.userDetails.first_name);
      localStorage.setItem('PortalEmail', userResponse.data.userDetails.email);

      return bearerToken;
    } else {
      // Log the error message for debugging
      console.error('Login error:', error);

      // Throw a more descriptive error
      throw new Error(`Login failed: ${error.message}`);
    }
  }
};
