import LoginComponent from "../../components/Login/LoginComponent";

function Login() {
  return (
    <>
      {/* React 19 hoists <title> into <head> while this page is mounted */}
      <title>Sign in · StockSense</title>
      <LoginComponent />
    </>
  );
}

export default Login;
