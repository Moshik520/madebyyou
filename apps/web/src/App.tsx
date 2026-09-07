import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { HowItWorks } from './components/HowItWorks';
import { Products } from './components/Products';
import './App.css';

function App() {
  return (
    <>
      <Navbar />

      <main>
        <Hero />
        <HowItWorks />
        <Products />
      </main>

      <footer className="footer">
        <div className="container">
          © {new Date().getFullYear()} MadeByYou — עיצוב מוצרים אישי
        </div>
      </footer>
    </>
  );
}

export default App;
