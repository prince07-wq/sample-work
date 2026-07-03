
import { useState } from 'react';
import FirstComponent, { Secondcomponent } from './firstcompo/NOone.jsx';

function App() {
  const [showFirst, setShowfirst] = useState(true);
  const [showsecond, setShowsecond] = useState(true);
  return (
    <div>
      <button onClick={() => setShowfirst(!showFirst)}>
        see component
      </button>
       {showFirst && <FirstComponent />}
      <br />
      <button onClick={() => setShowsecond(!showsecond)}>
        see second component
      </button>
      {showsecond && <Secondcomponent />}

     
      
    </div>
  );
}

export default App; 
