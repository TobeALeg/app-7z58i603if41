import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import routes from './routes';
import HomePage from './pages/HomePage';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow pt-16">
            <Routes>
              <Route 
                path="/" 
                element={<HomePage />} 
              />
              {routes.map((route, index) => (
                <Route
                  key={index}
                  path={route.path}
                  element={route.element}
                />
              ))}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
        <Toaster />
      </AuthProvider>
    </Router>
  );
}