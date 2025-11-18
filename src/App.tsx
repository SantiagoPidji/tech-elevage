import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DataProvider } from './utils/dataContext';
import { Layout } from './components/Layout';
import { Overview } from './pages/Overview';
import { DataTable } from './pages/DataTable';
import { CowList } from './pages/CowList';
import { CowProfile } from './pages/CowProfile';

function App() {
  return (
    <Router>
      <DataProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/table" element={<DataTable />} />
            <Route path="/cows" element={<CowList />} />
            <Route path="/cows/:id" element={<CowProfile />} />
          </Routes>
        </Layout>
      </DataProvider>
    </Router>
  );
}

export default App;
