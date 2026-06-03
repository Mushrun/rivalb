import BottomNav from './BottomNav';

export default function AppLayout({ children, className = '' }) {
    return (
        <div className="flex justify-center min-h-screen" style={{ background: '#0D0D0D' }}>
            <div className="w-full max-w-[430px] min-h-screen relative pb-20"
                style={{ background: '#0D0D0D' }}>
                <div className={`min-h-screen ${className}`}>
                    {children}
                </div>
                <BottomNav />
            </div>
        </div>
    );
}
