import DashboardComponent from "../../components/Dashboard/DashboardComponent";

function Dashboard() {
  return (
    <>
      {/* React 19 hoists <title> into <head> while this page is mounted */}
      <title>Operations Dashboard · StockSense</title>
      <DashboardComponent />
    </>
  );
}

export default Dashboard;