import SignupComponent from "../../components/Signup/SignupComponent";

function Signup() {
  return (
    <>
      {/* React 19 hoists <title> into <head> while this page is mounted */}
      <title>Create an account · StockSense</title>
      <SignupComponent />
    </>
  );
}

export default Signup;