interface TopbarProps {
  title: string;
  subtitle?: string;
}

export function Topbar({ title, subtitle }: TopbarProps) {
  return (
    <header
      className="flex items-center px-6 flex-shrink-0"
      style={{
        height: 64,
        backgroundColor: '#0B1220',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div>
        <h1 className="text-xl font-semibold leading-tight" style={{ color: '#FFFFFF' }}>{title}</h1>
        {subtitle && (
          <p className="text-sm leading-tight mt-0.5" style={{ color: '#94A3B8' }}>{subtitle}</p>
        )}
      </div>
    </header>
  );
}
