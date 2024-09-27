
import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Landing from './components/Landing'

function App() {
 

  return (

    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing></Landing>}></Route>
      </Routes>
    
    </BrowserRouter>
  )
}

export default App
