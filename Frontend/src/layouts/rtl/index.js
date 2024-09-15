import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import Footer from "examples/Footer";

import { useEffect } from "react";
import { usePlayVerseUIController, setDirection } from "context";


function RTL() {
  const [, dispatch] = usePlayVerseUIController();

  // Changing the direction to rtl
  useEffect(() => {
    setDirection(dispatch, "rtl");

    return () => setDirection(dispatch, "ltr");
  }, []);

  return (
    <DashboardLayout>    
      <Footer />
    </DashboardLayout>
  );
}

export default RTL;
