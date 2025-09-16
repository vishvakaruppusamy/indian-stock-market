import { useState } from 'react'
import Dasbord from './dasboard/Dasbord'
import Header from './components/Header'


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
       <div>
        <Header/>

        <Dasbord/>

        <Chart-bot/>

       </div>
    </>
  )
}

export default App
