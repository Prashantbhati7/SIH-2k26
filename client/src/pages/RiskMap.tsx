import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Filter } from 'lucide-react';
import { api } from '../services/api';

// Create Leaflet Custom Marker Icons
const createRiskIcon = (riskLevel: string) => {
  const color = riskLevel === 'High' ? '#e11d48' : (riskLevel === 'Medium' ? '#f59e0b' : '#10b981');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="28" height="28" stroke="#ffffff" stroke-width="2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`;
  return L.divIcon({
    html: svg,
    className: 'custom-map-marker',
    iconSize: [28, 28],
    iconAnchor: [14, 28]
  });
};

interface RiskMapProps {
  onSelectProject: (pCode: number) => void;
}

export const RiskMap: React.FC<RiskMapProps> = ({ onSelectProject }) => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [riskFilter, setRiskFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchMapProjects();
  }, [riskFilter]);

  const fetchMapProjects = async () => {
    try {
      setLoading(true);
      const params: any = { limit: 100 };
      if (riskFilter !== 'ALL') params.riskLevel = riskFilter;
      const res = await api.get('/projects', { params });
      setProjects(res.data.projects || []);
    } catch (err) {
      console.error('Fetch map error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">National Infrastructure Risk Map</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Geospatial map visualization of infrastructure projects across India categorized by XGBoost risk levels.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none shadow-xs"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="High">High Risk Only</option>
            <option value="Medium">Medium Risk Only</option>
            <option value="Low">Low Risk Only</option>
          </select>
        </div>
      </div>

      {/* Map Container */}
      <div className="h-[65vh] w-full rounded-2xl bg-white border border-slate-200/80 p-2 shadow-xs overflow-hidden relative">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-lime-500 rounded-full animate-spin" />
          </div>
        ) : (
          <MapContainer center={[20.5937, 78.9629]} zoom={5} scrollWheelZoom={true} className="w-full h-full rounded-xl">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {projects.map((p) => {
              const lat = p.latitude || (p.state === 'Uttar Pradesh' ? 27.1767 : (p.state === 'Delhi' ? 28.6139 : 19.0760));
              const lng = p.longitude || (p.state === 'Uttar Pradesh' ? 78.0081 : (p.state === 'Delhi' ? 77.2090 : 72.8777));
              
              const jitterLat = lat + ((p.projectCode % 10) - 5) * 0.15;
              const jitterLng = lng + ((p.projectCode % 7) - 3) * 0.15;

              return (
                <Marker key={p.id} position={[jitterLat, jitterLng]} icon={createRiskIcon(p.riskLevel)}>
                  <Popup>
                    <div className="p-2 space-y-2 text-xs text-slate-800 min-w-[200px]">
                      <div className="font-bold text-sm text-slate-900">{p.projectName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">Code: {p.projectCode}</div>
                      <div className="flex items-center justify-between pt-1">
                        <span>Risk Level:</span>
                        <span className={`font-bold ${p.riskLevel === 'High' ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {p.riskLevel} ({p.scorePercentage}%)
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Cost Overrun:</span>
                        <span className="font-semibold text-amber-700">{p.costPrediction}</span>
                      </div>
                      <button
                        onClick={() => onSelectProject(p.projectCode)}
                        className="w-full py-1.5 bg-lime-400 hover:bg-lime-500 text-slate-950 rounded-lg font-bold text-xs text-center block mt-2 shadow-xs"
                      >
                        Digital Profile
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        )}
      </div>
    </div>
  );
};
