import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AppShell } from '@/components/AppShell/AppShell';

// ── Page components (separate files) ────────────────────────────────────────
import { DashboardPage } from '@/pages/DashboardPage';
import { CharactersPage } from '@/pages/characters/CharactersPage';
import { InventoryPage } from '@/pages/inventory/InventoryPage';
import { HuntsPage } from '@/pages/hunts/HuntsPage';
import { WikiPage } from '@/pages/wiki/WikiPage';
import { AdminPage } from '@/pages/admin/AdminPage';
import { ServersPage } from '@/pages/servers/ServersPage';

import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';

// ── Inline stubs for sub-routes (real content in subsequent features) ────────
function CharacterNewPage() { return <p style={{ color: '#94A3B8' }}>New Character — coming in Phase 4</p>; }
function CharacterDetailPage() { return <p style={{ color: '#94A3B8' }}>Character Detail — coming in Phase 4</p>; }
function InventorySellPage() { return <p style={{ color: '#94A3B8' }}>Sell Decisions — coming in Phase 5</p>; }
function HuntsImportPage() { return <p style={{ color: '#94A3B8' }}>Import Hunt — coming in Phase 6</p>; }
function HuntDetailPage() { return <p style={{ color: '#94A3B8' }}>Hunt Detail — coming in Phase 6</p>; }
function WikiItemsPage() { return <p style={{ color: '#94A3B8' }}>Item Browser — coming in Phase 7</p>; }
function WikiItemDetailPage() { return <p style={{ color: '#94A3B8' }}>Item Detail — coming in Phase 7</p>; }
function WikiCreaturesPage() { return <p style={{ color: '#94A3B8' }}>Creature Browser — coming in Phase 7</p>; }
function WikiCreatureDetailPage() { return <p style={{ color: '#94A3B8' }}>Creature Detail — coming in Phase 7</p>; }
function AdminScraperPage() { return <p style={{ color: '#94A3B8' }}>Scraper — coming in Phase 8</p>; }

// Redirects to /dashboard when authenticated, otherwise /login
function LandingRedirect() {
  const { token } = useAuth();
  return <Navigate to={token ? '/dashboard' : '/login'} replace />;
}

// ── Router ───────────────────────────────────────────────────────────────────

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected — all authenticated routes render inside AppShell */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <AppShell title="Dashboard">
              <DashboardPage />
            </AppShell>
          </ProtectedRoute>
        } />
        <Route path="/characters" element={
          <ProtectedRoute>
            <AppShell title="Characters">
              <CharactersPage />
            </AppShell>
          </ProtectedRoute>
        } />
        <Route path="/characters/new" element={
          <ProtectedRoute>
            <AppShell title="New Character">
              <CharacterNewPage />
            </AppShell>
          </ProtectedRoute>
        } />
        <Route path="/characters/:id" element={
          <ProtectedRoute>
            <AppShell title="Character">
              <CharacterDetailPage />
            </AppShell>
          </ProtectedRoute>
        } />
        <Route path="/inventory/:characterId" element={
          <ProtectedRoute>
            <AppShell title="Inventory">
              <InventoryPage />
            </AppShell>
          </ProtectedRoute>
        } />
        <Route path="/inventory/:characterId/sell" element={
          <ProtectedRoute>
            <AppShell title="Sell Decisions">
              <InventorySellPage />
            </AppShell>
          </ProtectedRoute>
        } />
        <Route path="/hunts/:characterId" element={
          <ProtectedRoute>
            <AppShell title="Hunt Sessions">
              <HuntsPage />
            </AppShell>
          </ProtectedRoute>
        } />
        <Route path="/hunts/:characterId/import" element={
          <ProtectedRoute>
            <AppShell title="Import Hunt">
              <HuntsImportPage />
            </AppShell>
          </ProtectedRoute>
        } />
        {/* /hunts/session/:id avoids param collision with /hunts/:characterId */}
        <Route path="/hunts/session/:id" element={
          <ProtectedRoute>
            <AppShell title="Hunt Session">
              <HuntDetailPage />
            </AppShell>
          </ProtectedRoute>
        } />
        <Route path="/wiki" element={
          <ProtectedRoute>
            <AppShell title="Wiki">
              <WikiPage />
            </AppShell>
          </ProtectedRoute>
        } />
        <Route path="/wiki/items" element={
          <ProtectedRoute>
            <AppShell title="Item Browser">
              <WikiItemsPage />
            </AppShell>
          </ProtectedRoute>
        } />
        <Route path="/wiki/items/:id" element={
          <ProtectedRoute>
            <AppShell title="Item Detail">
              <WikiItemDetailPage />
            </AppShell>
          </ProtectedRoute>
        } />
        <Route path="/wiki/creatures" element={
          <ProtectedRoute>
            <AppShell title="Creature Browser">
              <WikiCreaturesPage />
            </AppShell>
          </ProtectedRoute>
        } />
        <Route path="/wiki/creatures/:id" element={
          <ProtectedRoute>
            <AppShell title="Creature Detail">
              <WikiCreatureDetailPage />
            </AppShell>
          </ProtectedRoute>
        } />
        <Route path="/servers" element={
          <ProtectedRoute>
            <AppShell title="Servers">
              <ServersPage />
            </AppShell>
          </ProtectedRoute>
        } />

        {/* Protected — ADMIN only */}
        <Route path="/admin" element={
          <ProtectedRoute adminOnly>
            <AppShell title="Admin">
              <AdminPage />
            </AppShell>
          </ProtectedRoute>
        } />
        <Route path="/admin/scraper" element={
          <ProtectedRoute adminOnly>
            <AppShell title="Scraper">
              <AdminScraperPage />
            </AppShell>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
