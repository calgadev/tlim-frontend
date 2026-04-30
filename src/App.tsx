import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// ── Stub page components ────────────────────────────────────────────────────

function LoginPage() { return <h1>Login</h1>; }
function RegisterPage() { return <h1>Register</h1>; }
function DashboardPage() { return <h1>Dashboard</h1>; }
function CharactersPage() { return <h1>Characters</h1>; }
function CharacterNewPage() { return <h1>New Character</h1>; }
function CharacterDetailPage() { return <h1>Character Detail</h1>; }
function InventoryPage() { return <h1>Inventory</h1>; }
function InventorySellPage() { return <h1>Sell Decisions</h1>; }
function HuntsPage() { return <h1>Hunt Sessions</h1>; }
function HuntsImportPage() { return <h1>Import Hunt</h1>; }
function HuntDetailPage() { return <h1>Hunt Detail</h1>; }
function WikiItemsPage() { return <h1>Item Wiki</h1>; }
function WikiItemDetailPage() { return <h1>Item Detail</h1>; }
function WikiCreaturesPage() { return <h1>Creature Wiki</h1>; }
function WikiCreatureDetailPage() { return <h1>Creature Detail</h1>; }
function PricesPage() { return <h1>Market Prices</h1>; }
function ServersPage() { return <h1>Servers</h1>; }
function AdminPage() { return <h1>Admin Panel</h1>; }
function AdminScraperPage() { return <h1>Scraper</h1>; }

// Redirect to /dashboard if logged in, otherwise /login
function LandingRedirect() {
  const { token } = useAuth();
  return <Navigate to={token ? '/dashboard' : '/login'} replace />;
}

// ── Router ──────────────────────────────────────────────────────────────────

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected — USER */}
        <Route path="/dashboard" element={
          <ProtectedRoute><DashboardPage /></ProtectedRoute>
        } />
        <Route path="/characters" element={
          <ProtectedRoute><CharactersPage /></ProtectedRoute>
        } />
        <Route path="/characters/new" element={
          <ProtectedRoute><CharacterNewPage /></ProtectedRoute>
        } />
        <Route path="/characters/:id" element={
          <ProtectedRoute><CharacterDetailPage /></ProtectedRoute>
        } />
        <Route path="/inventory/:characterId" element={
          <ProtectedRoute><InventoryPage /></ProtectedRoute>
        } />
        <Route path="/inventory/:characterId/sell" element={
          <ProtectedRoute><InventorySellPage /></ProtectedRoute>
        } />
        <Route path="/hunts/:characterId" element={
          <ProtectedRoute><HuntsPage /></ProtectedRoute>
        } />
        <Route path="/hunts/:characterId/import" element={
          <ProtectedRoute><HuntsImportPage /></ProtectedRoute>
        } />
        <Route path="/hunts/session/:id" element={
          <ProtectedRoute><HuntDetailPage /></ProtectedRoute>
        } />
        <Route path="/wiki/items" element={
          <ProtectedRoute><WikiItemsPage /></ProtectedRoute>
        } />
        <Route path="/wiki/items/:id" element={
          <ProtectedRoute><WikiItemDetailPage /></ProtectedRoute>
        } />
        <Route path="/wiki/creatures" element={
          <ProtectedRoute><WikiCreaturesPage /></ProtectedRoute>
        } />
        <Route path="/wiki/creatures/:id" element={
          <ProtectedRoute><WikiCreatureDetailPage /></ProtectedRoute>
        } />
        <Route path="/prices/:serverId" element={
          <ProtectedRoute><PricesPage /></ProtectedRoute>
        } />
        <Route path="/servers" element={
          <ProtectedRoute><ServersPage /></ProtectedRoute>
        } />

        {/* Protected — ADMIN only */}
        <Route path="/admin" element={
          <ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>
        } />
        <Route path="/admin/scraper" element={
          <ProtectedRoute adminOnly><AdminScraperPage /></ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
