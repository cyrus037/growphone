import { useLocation, Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const Breadcrumbs = () => {
  const location = useLocation();
  
  // Don't show breadcrumbs on home page
  if (location.pathname === '/') {
    return null;
  }

  const getBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter(x => x);
    const breadcrumbs = [
      { name: 'Home', path: '/' }
    ];

    pathnames.forEach((path, index) => {
      const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
      const isLast = index === pathnames.length - 1;
      
      // Map paths to readable names
      const nameMap = {
        'blog': 'Blog',
        'contact': 'Contact',
        'admin-portal': 'Admin Portal'
      };
      
      breadcrumbs.push({
        name: nameMap[path] || path.charAt(0).toUpperCase() + path.slice(1),
        path: routeTo,
        isLast
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <nav aria-label="Breadcrumb navigation" className="breadcrumbs">
      <ol className="breadcrumbs-list">
        {breadcrumbs.map((breadcrumb, index) => (
          <li key={breadcrumb.path} className="breadcrumb-item">
            {index === 0 ? (
              <Link to={breadcrumb.path} className="breadcrumb-home">
                <Home size={16} />
                <span className="sr-only">Home</span>
              </Link>
            ) : breadcrumb.isLast ? (
              <span className="breadcrumb-current" aria-current="page">
                {breadcrumb.name}
              </span>
            ) : (
              <Link to={breadcrumb.path} className="breadcrumb-link">
                {breadcrumb.name}
              </Link>
            )}
            {!breadcrumb.isLast && (
              <span className="breadcrumb-separator" aria-hidden="true">
                /
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
