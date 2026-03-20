import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ManageNews from './pages/manageNews';
import ManageCategory from './pages/manageCategory';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/manage-news" replace />} />
          <Route path="manage-news" element={<ManageNews />} />
          <Route path="manage-category" element={<ManageCategory />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
