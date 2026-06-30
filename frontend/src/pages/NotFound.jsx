import { Link } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';

const NotFound = () => (
  <PublicLayout>
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center px-4">
      <h1 className="text-6xl font-bold text-primary-600">404</h1>
      <p className="text-xl text-gray-500 mt-4">Page not found</p>
      <Link to="/" className="btn-primary mt-6">Go Home</Link>
    </div>
  </PublicLayout>
);

export default NotFound;
