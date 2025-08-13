import { useAuth } from '../auth/AuthContext';
import Sentiment from '../components/sentiment';

function Stocks() {
  const { user, signOut } = useAuth();
  
  return (
    <>
        <div style={{ backgroundColor: 'rgb(1, 3, 33)', minHeight: '100vh', overflow: 'auto'}}>
            <div style={{ }}>
                <button
                    onClick={signOut}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                    Sign Out
                </button>
              </div>
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '15em'}}> 
                <Sentiment/>
            </div>
        </div>
    </>

  );
}

export default Stocks;

/*

<h1>Welcome to the Stocks Page, {user?.email}</h1>
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                    <h1 className="text-xl font-bold text-gray-900">Stock Dashboard</h1>
                    </div>
                    <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                        Welcome, {user?.email}
                    </span>
                    <button
                        onClick={signOut}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                        Sign Out
                    </button>
                    </div>
                </div>
                </div>
            </nav>
            <div style={{ position: 'absolute', display: 'flex', justifyContent: 'center', alignItems:'center'}}>
                <StocksPage/>
            </div>

*/
