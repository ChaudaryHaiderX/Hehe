import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import DataDisplay from './DataDisplay';
// import ComercialRegionTable from '../src/TableDisplayData/ComercialRegionTable';
// import LoadSheddingChart from './LoadSheddingChart';
// import MbuData from './MbuData';
// import ComercialRegion from './ComercialRegion';
// import { Route } from 'react-router-dom';
import Signin from '../src/Components/Signin';
import Dashboard from '../src/Components/Dashboard';
import LoadShd from '../src/Components/LoadShd';
import ReportGen from '../src/Components/ReportGen';
import UploadReport from '../src/Components/UploadReport';
import BillPrediction from './Components/BillPrediction';


const App = () => {
  return (
    <>
      <Router>
        <div>
          <Routes>
            <Route exact path="/signin" element={<Signin />} />
            <Route exact path="/dashboard" element={<Dashboard />} />
            <Route exact path="/loadShd" element={<LoadShd />} />
            <Route exact path="/reportgen" element={<ReportGen />} />
            <Route exact path="/uploadReport" element={<UploadReport />} />
            <Route exact path="/billPre" element={<BillPrediction />} />

            <Route path="/" element={<Signin />} />

          </Routes>
        </div>
      </Router>
    </>

  );
};
export default App;
