import React from 'react';
import { Menu, Upload, Download } from 'lucide-react';

interface NavigationBarProps {
    onImport: () => void;
    onExport: () => void;
}

const NavigationBar: React.FC<NavigationBarProps> = ({ onImport, onExport }) => {
    const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

    return (
        <nav className="bg-purple-600 text-white p-4 mb-4">
            <div className="max-w-2xl mx-auto flex justify-between items-center">
                <h1 className="text-2xl font-bold">Battle Tracker</h1>
                
                <div className="relative">
                    <button 
                        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                        className="p-2 hover:bg-purple-700 rounded-full"
                        aria-label="settingsButton"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    
                    {isSettingsOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 text-gray-700">
                            <button
                                onClick={() => {
                                    onImport();
                                    setIsSettingsOpen(false);
                                }}
                                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full"
                                aria-label="importStateMenuItem"
                            >
                                <Upload className="w-5 h-5" />
                                Import State
                            </button>
                            <button
                                onClick={() => {
                                    onExport();
                                    setIsSettingsOpen(false);
                                }}
                                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full"
                                aria-label="exportStateMenuItem"
                            >
                                <Download className="w-5 h-5" />
                                Export State
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default NavigationBar;
