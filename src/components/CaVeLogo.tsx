interface CaVeLogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'icon';
  className?: string;
}

const sizeMap = {
  sm: { icon: 28, text: 'text-lg' },
  md: { icon: 40, text: 'text-2xl' },
  lg: { icon: 56, text: 'text-4xl' },
};

export default function CaVeLogo({ size = 'md', variant = 'full', className = '' }: CaVeLogoProps) {
  const { icon, text } = sizeMap[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Calendar Icon */}
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <rect x="5" y="5" width="90" height="90" rx="16" fill="#0d3b66" />
        <rect x="15" y="30" width="70" height="55" rx="4" fill="white" />
        <rect x="15" y="15" width="70" height="20" rx="4" fill="white" fillOpacity="0.3" />
        <rect x="55" y="50" width="15" height="15" rx="3" fill="#0d3b66" />
      </svg>

      {/* Text Logo */}
      {variant === 'full' && (
        <span className={`font-bold tracking-tight text-cave-dark ${text}`}>
          Ca<span className="text-cave-blue">Ve</span>
        </span>
      )}
    </div>
  );
}
