import './App.css';
import { Route } from 'react-router-dom';
import homePage from './pages/homePage';
import chatPage from './pages/chatPage';

function App() {
  return (
    <div className="App">
      <Route path="/" component= {homePage} exact/> {/* exact is used to match the exact path */}
      <Route path="/chats" component= {chatPage}/>
    </div>
  );
}

export default App;
