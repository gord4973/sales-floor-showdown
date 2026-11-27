import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './lib/auth'
import { Shell } from './components/Shell'
import { Login } from './pages/Login'
import { Home } from './pages/Home'
import { Lightning } from './pages/Lightning'
import { WalkList, WalkPlay } from './pages/Walk'
import { Arena, DuelRoom } from './pages/Arena'
import { Wheel } from './pages/Wheel'
import { Boss } from './pages/Boss'
import { Daily } from './pages/Daily'
import { Board } from './pages/Board'
import { Locker } from './pages/Locker'
import { TV } from './pages/TV'
import { Manager } from './pages/Manager'
import { Admin } from './pages/Admin'

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/tv" element={<TV />} />
          <Route element={<Shell />}>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Home />} />
            <Route path="/lightning" element={<Lightning />} />
            <Route path="/walk" element={<WalkList />} />
            <Route path="/walk/:id" element={<WalkPlay />} />
            <Route path="/arena" element={<Arena />} />
            <Route path="/arena/:id" element={<DuelRoom />} />
            <Route path="/wheel" element={<Wheel />} />
            <Route path="/boss" element={<Boss />} />
            <Route path="/daily" element={<Daily />} />
            <Route path="/board" element={<Board />} />
            <Route path="/locker" element={<Locker />} />
            <Route path="/manager" element={<Manager />} />
            <Route path="/admin" element={<Admin />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
