import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import ManageNews from './pages/manageNews';
import ManageCategory from './pages/manageCategory';

function App() {
  return (
    <BrowserRouter>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            fontSize: '12px',
          },
        }}
      />
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
