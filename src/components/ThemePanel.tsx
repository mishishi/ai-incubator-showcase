import { ACCENT_COLORS } from '../data/projects';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function ThemePanel({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  const apply = (hex: string) => {
    document.documentElement.style.setProperty('--accent', hex);
    localStorage.setItem('accent', hex);
    onClose();
  };

  return (
    <>
      <div className="theme-overlay open" onClick={onClose} />
      <div className="theme-panel open">
        <h3>选择主题色</h3>
        <div className="theme-swatches">
          {ACCENT_COLORS.map(c => (
            <div
              key={c.hex}
              className="theme-swatch"
              style={{ background: c.hex }}
              title={c.name}
              onClick={() => apply(c.hex)}
            />
          ))}
        </div>
        <div className="theme-custom">
          <input
            id="customHex"
            placeholder="#E07A3A"
            maxLength={7}
            style={{ flex: 1, background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', padding: '6px 10px', borderRadius: 6, fontSize: 12, outline: 'none' }}
          />
          <button onClick={() => {
            const input = document.getElementById('customHex') as HTMLInputElement;
            if (/^#[0-9A-Fa-f]{6}$/.test(input.value)) apply(input.value);
          }}>应用</button>
        </div>
      </div>
    </>
  );
}