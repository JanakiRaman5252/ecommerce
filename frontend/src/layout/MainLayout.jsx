import Navbar from '../components/ui/Navbar'
import { Outlet } from 'react-router-dom'
import Footer from '../components/ui/Footer'
import { Toaster } from 'react-hot-toast';

const MainLayout = ({NumCartItems}) => {
  return (
    <div className='flex flex-col min-h-screen'>
        <Navbar NumCartItems={NumCartItems}/>
        <Toaster position="top-right" reverseOrder={false} />

        <div className='flex-grow mt-20'>
            <Outlet/>

        </div>
        <Footer/>
    </div>
  )
}

export default MainLayout
