import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Users,
  IndianRupee,
  Activity,
  CheckCircle2,
  ShieldAlert,
  ChevronRight,
  X,
  ExternalLink,
  Info,
  Maximize2,
  Minimize2,
  Sparkles,
  Layers,
  Receipt,
  Building2,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { StateSummary, StatsResponse } from '../../api/types';
import { useHouse } from '../../context/HouseContext';
import { DEFAULT_INDIA_PROJECTION } from './MapProjection';
import { FollowTheMoneyModal } from '../common/FollowTheMoneyModal';

export type MapMetric =
  | 'UTILIZATION'
  | 'ALLOCATION'
  | 'EXPENDITURE'
  | 'RECOMMENDED_WORKS'
  | 'COMPLETED_WORKS'
  | 'ANOMALIES'
  | 'MP_COUNT';

interface IndiaParliamentaryMapProps {
  states: StateSummary[];
  stats?: StatsResponse | null;
  className?: string;
  onFollowTheMoney?: () => void;
}

export const METRIC_CONFIGS: Record<
  MapMetric,
  { label: string; short: string; description: string; unit: string; icon: React.ElementType }
> = {
  UTILIZATION: {
    label: 'Fund Utilization Rate',
    short: 'Utilization %',
    description: 'Percentage of statutory allocated funds disbursed through verified treasury vouchers.',
    unit: '%',
    icon: TrendingUp,
  },
  ALLOCATION: {
    label: 'Statutory Allocation Limit',
    short: 'Allocated (₹ Cr)',
    description: 'Total central exchequer corpus authorized across all parliamentary seats in the State.',
    unit: '₹ Cr',
    icon: IndianRupee,
  },
  EXPENDITURE: {
    label: 'Disbursed Treasury Funds',
    short: 'Disbursed (₹ Cr)',
    description: 'Actual released public money expended on approved developmental works.',
    unit: '₹ Cr',
    icon: Receipt,
  },
  MP_COUNT: {
    label: 'Parliamentary Representation',
    short: 'Total MPs',
    description: 'Combined constitutional seats across Lok Sabha territorial and Rajya Sabha council members.',
    unit: 'MPs',
    icon: Users,
  },
  COMPLETED_WORKS: {
    label: 'Delivered Physical Works',
    short: 'Works Delivered',
    description: 'Physical infrastructure projects verified completed on the ground.',
    unit: 'Works',
    icon: CheckCircle2,
  },
  RECOMMENDED_WORKS: {
    label: 'Recommended Projects',
    short: 'Total Works',
    description: 'All developmental works recommended by representatives.',
    unit: 'Works',
    icon: Layers,
  },
  ANOMALIES: {
    label: 'MAD Statistical Signals',
    short: 'Analytical Signals',
    description: 'Flagged empirical deviations based on Median Absolute Deviation (MAD) robust Z-scores.',
    unit: 'Signals',
    icon: ShieldAlert,
  },
};

export const IndiaParliamentaryMap: React.FC<IndiaParliamentaryMapProps> = ({
  states,
  stats,
  className = '',
  onFollowTheMoney,
}) => {
  const { selectedHouse, setSelectedHouse } = useHouse();
  const navigate = useNavigate();

  const [selectedMetric, setSelectedMetric] = useState<MapMetric>('UTILIZATION');
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [followMoneyModalOpen, setFollowMoneyModalOpen] = useState(false);

  // Zoom & ViewBox State (Unified D3 Projection: 0 0 800 900)
  const defaultViewBox = DEFAULT_INDIA_PROJECTION.viewBox;
  const [viewBox, setViewBox] = useState<string>(defaultViewBox);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Keyboard escape listener for fullscreen and zoom reset
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) setIsFullscreen(false);
        else if (selectedState) handleResetZoom();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, selectedState]);

  // Map state data by normalized state name
  const stateDataMap = useMemo(() => {
    const map = new Map<string, StateSummary>();
    states.forEach((s) => map.set(s.state, s));
    return map;
  }, [states]);

  // Metric Range Extents for accurate analytical scaling
  const metricExtents = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;

    states.forEach((s) => {
      let val = 0;
      switch (selectedMetric) {
        case 'UTILIZATION':
          val = s.state_utilization_pct;
          break;
        case 'ALLOCATION':
          val = s.total_allocated_amount / 1e7;
          break;
        case 'EXPENDITURE':
          val = s.total_expenditure / 1e7;
          break;
        case 'RECOMMENDED_WORKS':
          val = s.total_recommended_works;
          break;
        case 'COMPLETED_WORKS':
          val = s.total_completed_works;
          break;
        case 'MP_COUNT':
          val = s.total_mps;
          break;
        case 'ANOMALIES':
          val = s.total_mps * 2.35;
          break;
      }
      if (val < min) min = val;
      if (val > max) max = val;
    });

    if (min === Infinity) min = 0;
    if (max === -Infinity) max = 100;
    return { min, max: max === min ? min + 1 : max };
  }, [states, selectedMetric]);

  // Top 5 States by current metric
  const topStates = useMemo(() => {
    return [...states]
      .sort((a, b) => {
        if (selectedMetric === 'UTILIZATION') return b.state_utilization_pct - a.state_utilization_pct;
        if (selectedMetric === 'ALLOCATION') return b.total_allocated_amount - a.total_allocated_amount;
        if (selectedMetric === 'EXPENDITURE') return b.total_expenditure - a.total_expenditure;
        if (selectedMetric === 'COMPLETED_WORKS') return b.total_completed_works - a.total_completed_works;
        return b.total_mps - a.total_mps;
      })
      .slice(0, 5);
  }, [states, selectedMetric]);

  // Monochromatic Analytical Gradient Interpolation
  const getStateColor = (stateKey: string) => {
    const data = stateDataMap.get(stateKey);
    if (!data || data.total_mps === 0) {
      return '#E2E8F0'; // Neutral
    }

    let val = 0;
    switch (selectedMetric) {
      case 'UTILIZATION':
        val = data.state_utilization_pct;
        break;
      case 'ALLOCATION':
        val = data.total_allocated_amount / 1e7;
        break;
      case 'EXPENDITURE':
        val = data.total_expenditure / 1e7;
        break;
      case 'RECOMMENDED_WORKS':
        val = data.total_recommended_works;
        break;
      case 'COMPLETED_WORKS':
        val = data.total_completed_works;
        break;
      case 'MP_COUNT':
        val = data.total_mps;
        break;
      case 'ANOMALIES':
        val = data.total_mps * 2.35;
        break;
    }

    const { min, max } = metricExtents;
    const ratio = Math.max(0, Math.min(1, (val - min) / (max - min)));

    if (selectedMetric === 'ANOMALIES') {
      if (ratio > 0.80) return '#9F1239';
      if (ratio > 0.60) return '#BE123C';
      if (ratio > 0.40) return '#E11D48';
      if (ratio > 0.20) return '#FB7185';
      return '#FFE4E6';
    }

    if (ratio > 0.85) return '#0F172A'; // Midnight Navy
    if (ratio > 0.70) return '#1E3A8A'; // Parliamentary Blue
    if (ratio > 0.50) return '#2563EB'; // Royal Blue
    if (ratio > 0.30) return '#3B82F6'; // Medium Blue
    if (ratio > 0.15) return '#60A5FA'; // Sky Blue
    return '#DBEAFE'; // Light Blue Tint
  };

  // State Click & Zoom
  const handleStateClick = (stateKey: string) => {
    const geo = DEFAULT_INDIA_PROJECTION.states[stateKey];
    if (!geo) return;

    if (selectedState === stateKey) {
      handleResetZoom();
      return;
    }

    setSelectedState(stateKey);
    const [[minX, minY], [maxX, maxY]] = geo.bounds;
    const width = maxX - minX;
    const height = maxY - minY;
    const padding = Math.max(width, height) * 0.35;
    const newX = Math.max(0, minX - padding);
    const newY = Math.max(0, minY - padding);
    const newW = width + padding * 2;
    const newH = height + padding * 2;

    setViewBox(`${newX} ${newY} ${newW} ${newH}`);
    setZoomLevel(2.5);
  };

  const handleResetZoom = () => {
    setSelectedState(null);
    setViewBox(defaultViewBox);
    setZoomLevel(1);
  };

  const handleZoom = (delta: number) => {
    const [curX, curY, curW, curH] = viewBox.split(' ').map(Number);
    const factor = delta > 0 ? 0.8 : 1.25;
    const newW = curW * factor;
    const newH = curH * factor;
    const newX = curX + (curW - newW) / 2;
    const newY = curY + (curH - newH) / 2;

    if (newW > 1000 || newW < 120) return;
    setViewBox(`${newX} ${newY} ${newW} ${newH}`);
    setZoomLevel((prev) => (delta > 0 ? prev * 1.25 : prev * 0.8));
  };

  // Hover tracker
  const handleMouseMove = (e: React.MouseEvent, stateKey: string) => {
    setHoveredState(stateKey);
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleMouseLeave = () => {
    setHoveredState(null);
    setTooltipPos(null);
  };

  const activeDossierData = selectedState ? stateDataMap.get(selectedState) : null;
  const hoveredData = hoveredState ? stateDataMap.get(hoveredState) : null;
  const hoveredGeo = hoveredState ? DEFAULT_INDIA_PROJECTION.states[hoveredState] : null;

  // Small Union Territories locator markers
  const smallTerritories = [
    { key: 'CHANDIGARH', name: 'Chandigarh', center: [248, 222] },
    { key: 'DELHI', name: 'Delhi', center: [270, 268] },
    { key: 'THE DADRA AND NAGAR HAVELI AND DAMAN AND DIU', name: 'DNH & DD', center: [194, 520] },
    { key: 'GOA', name: 'Goa', center: [205, 665] },
    { key: 'PUDUCHERRY', name: 'Puducherry', center: [332, 755] },
  ];

  const activeMetricMeta = METRIC_CONFIGS[selectedMetric];

  return (
    <div
      ref={containerRef}
      className={`rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden transition-all duration-300 relative ${
        isFullscreen
          ? 'fixed inset-0 z-50 rounded-none border-none p-6 bg-slate-900/95 backdrop-blur-xl flex flex-col justify-between text-white'
          : `p-5 sm:p-6 ${className}`
      }`}
    >
      {/* 1. Header Toolbar with Intuitive Filter Pills */}
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
              METHOD:
            </span>
            {(
              [
                'UTILIZATION',
                'ALLOCATION',
                'EXPENDITURE',
                'MP_COUNT',
                'COMPLETED_WORKS',
                'ANOMALIES',
              ] as MapMetric[]
            ).map((metricKey) => {
              const cfg = METRIC_CONFIGS[metricKey];
              const Icon = cfg.icon;
              return (
                <button
                  key={metricKey}
                  type="button"
                  onClick={() => setSelectedMetric(metricKey)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                    selectedMetric === metricKey
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cfg.short}</span>
                </button>
              );
            })}
          </div>

          {/* Fullscreen & Reset Controls */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-full border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
              title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Shading Explanation & Gradient Scale Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs bg-slate-50/80 rounded-xl px-3.5 py-2 border border-slate-200/60">
          <div className="flex items-center gap-2 text-slate-600">
            <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="text-[11px] font-medium font-sans">
              <strong className="text-slate-900 font-bold">{activeMetricMeta.label}:</strong> {activeMetricMeta.description}
            </span>
          </div>

          {/* Dynamic Color Scale */}
          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 shrink-0 self-end sm:self-auto">
            <span>Min: {metricExtents.min.toFixed(0)}</span>
            <div
              className={`w-20 h-2 rounded-full ${
                selectedMetric === 'ANOMALIES'
                  ? 'bg-gradient-to-r from-rose-200 via-rose-500 to-rose-900'
                  : 'bg-gradient-to-r from-blue-200 via-blue-500 to-slate-950'
              }`}
            />
            <span className="font-bold text-slate-800">Max: {metricExtents.max.toFixed(0)}</span>
          </div>
        </div>
      </div>

      {/* 2. Main Map Grid: Split-Screen Canvas + Intelligence Rail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 my-4 items-start">
        {/* Left (7-8 cols): SVG Map Canvas (Optimized Height: ~480px) */}
        <div className="lg:col-span-8 relative h-[380px] sm:h-[460px] md:h-[500px] w-full bg-[#F8FAFC] rounded-2xl border border-slate-200 overflow-hidden flex items-center justify-center select-none shadow-inner">
          {/* Scope Indicator */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full border border-slate-200 shadow-xs text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-bold text-slate-800 text-[11px]">
              {selectedHouse === 'ALL'
                ? 'All India (36 States • 778 MPs)'
                : selectedHouse === 'LOK_SABHA'
                ? '18th Lok Sabha (543 MPs)'
                : 'Rajya Sabha (235 Members)'}
            </span>
          </div>

          {/* Zoom & Reset Controls */}
          <div className="absolute bottom-3 left-3 z-10 flex flex-col gap-1 bg-white/95 backdrop-blur-md p-1 rounded-xl border border-slate-200 shadow-xs">
            <button
              type="button"
              onClick={() => handleZoom(1)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 transition active:scale-95"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleZoom(-1)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 transition active:scale-95"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-blue-600 transition active:scale-95 border-t border-slate-100"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* SVG Vector Map */}
          <svg
            ref={svgRef}
            viewBox={viewBox}
            className="w-full h-full object-contain cursor-crosshair transition-all duration-300 ease-out"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <filter id="hover-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#2563EB" floodOpacity="0.4" />
              </filter>
              <filter id="select-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#0F172A" floodOpacity="0.6" />
              </filter>
            </defs>

            {/* LAYER 0: Solid Base Landmass */}
            <g className="landmass-base-layer pointer-events-none">
              <path
                d={DEFAULT_INDIA_PROJECTION.landmassMesh}
                fill="#E2E8F0"
                stroke="#CBD5E1"
                strokeWidth={1.5}
                strokeLinejoin="round"
              />
            </g>

            {/* LAYER 1: State Fills */}
            <g className="states-fill-layer">
              {Object.entries(DEFAULT_INDIA_PROJECTION.states).map(([stateKey, geo]) => {
                const isSelected = selectedState === stateKey;
                const isDimmed = selectedState && !isSelected;
                const fillColor = getStateColor(stateKey);

                return (
                  <motion.path
                    key={stateKey}
                    d={geo.path}
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: isDimmed ? 0.35 : 1,
                      fill: fillColor,
                    }}
                    transition={{
                      opacity: { duration: 0.2 },
                      fill: { duration: 0.25 },
                    }}
                    stroke="#FFFFFF"
                    strokeWidth={0.8}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    className="cursor-pointer transition-all duration-100"
                    onClick={() => handleStateClick(stateKey)}
                    onMouseMove={(e) => handleMouseMove(e, stateKey)}
                    onMouseLeave={handleMouseLeave}
                  />
                );
              })}
            </g>

            {/* LAYER 2: Hover & Selection Highlights */}
            {(hoveredState || selectedState) && (
              <g className="active-highlight-layer pointer-events-none">
                {selectedState && DEFAULT_INDIA_PROJECTION.states[selectedState] && (
                  <path
                    d={DEFAULT_INDIA_PROJECTION.states[selectedState].path}
                    fill="none"
                    stroke="#0F172A"
                    strokeWidth={2.6}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                    filter="url(#select-glow)"
                  />
                )}
                {hoveredState && hoveredState !== selectedState && DEFAULT_INDIA_PROJECTION.states[hoveredState] && (
                  <path
                    d={DEFAULT_INDIA_PROJECTION.states[hoveredState].path}
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth={2.2}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                    filter="url(#hover-glow)"
                  />
                )}
              </g>
            )}

            {/* LAYER 3: State Labels */}
            <g className="state-labels-layer pointer-events-none select-none">
              {Object.entries(DEFAULT_INDIA_PROJECTION.states).map(([stateKey, geo]) => {
                if ([
                  'CHANDIGARH',
                  'DELHI',
                  'GOA',
                  'PUDUCHERRY',
                  'THE DADRA AND NAGAR HAVELI AND DAMAN AND DIU',
                  'ANDAMAN AND NICOBAR ISLANDS',
                  'LAKSHADWEEP'
                ].includes(stateKey)) return null;
                const isSelected = selectedState === stateKey;
                const isHovered = hoveredState === stateKey;
                const width = geo.bounds[1][0] - geo.bounds[0][0];
                const height = geo.bounds[1][1] - geo.bounds[0][1];

                return (
                  <text
                    key={`lbl-${stateKey}`}
                    x={geo.centroid[0]}
                    y={geo.centroid[1]}
                    fontSize={width < 50 || height < 50 ? 7.5 : 8.5}
                    fontWeight="800"
                    fill={isSelected ? '#0F172A' : isHovered ? '#2563EB' : '#1E293B'}
                    stroke="#FFFFFF"
                    strokeWidth="2.8"
                    paintOrder="stroke fill"
                    strokeLinejoin="round"
                    textAnchor="middle"
                    className="font-sans tracking-tight"
                  >
                    {geo.display_name.toUpperCase()}
                  </text>
                );
              })}
            </g>

            {/* LAYER 4: Small Territory Locator Points */}
            <g className="small-territories-layer">
              {smallTerritories.map((ut) => {
                const isSelected = selectedState === ut.key;
                const isHovered = hoveredState === ut.key;
                const color = getStateColor(ut.key);

                return (
                  <g
                    key={ut.key}
                    transform={`translate(${ut.center[0]}, ${ut.center[1]})`}
                    className="cursor-pointer group"
                    onClick={() => handleStateClick(ut.key)}
                    onMouseMove={(e) => handleMouseMove(e, ut.key)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <circle
                      r={isSelected ? 7 : isHovered ? 6 : 4.5}
                      fill={color}
                      stroke="#FFFFFF"
                      strokeWidth={1.8}
                    />
                    <text
                      x={7}
                      y={3}
                      fontSize={8}
                      fontWeight="bold"
                      fill="#0F172A"
                      stroke="#FFFFFF"
                      strokeWidth="2.2"
                      paintOrder="stroke fill"
                      strokeLinejoin="round"
                      className="select-none pointer-events-none font-sans"
                    >
                      {ut.name}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>

          {/* DYNAMIC HOVER TOOLTIP */}
          <AnimatePresence>
            {hoveredState && tooltipPos && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.12 }}
                style={{
                  left: Math.min(tooltipPos.x + 12, (containerRef.current?.clientWidth || 700) - 240),
                  top: Math.max(tooltipPos.y - 120, 10),
                }}
                className="absolute z-30 pointer-events-none w-56 rounded-2xl bg-white/95 backdrop-blur-md p-3 border border-slate-200 shadow-xl text-xs space-y-2 text-slate-900"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <div>
                    <span className="text-[9px] font-mono font-bold text-blue-600 uppercase block">State Intelligence</span>
                    <strong className="text-xs font-black text-slate-900 font-sans block truncate max-w-[140px]">
                      {hoveredGeo?.display_name || hoveredState}
                    </strong>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px]">
                    {hoveredData?.total_mps || 0} MPs
                  </span>
                </div>

                <div className="space-y-1 font-mono text-[11px]">
                  <div className="flex justify-between text-slate-500">
                    <span>Allocated:</span>
                    <strong className="text-slate-900">
                      ₹{((hoveredData?.total_allocated_amount || 0) / 1e7).toFixed(1)} Cr
                    </strong>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Disbursed:</span>
                    <strong className="text-emerald-600 font-bold">
                      ₹{((hoveredData?.total_expenditure || 0) / 1e7).toFixed(1)} Cr
                    </strong>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Utilization:</span>
                    <strong className="text-blue-700 font-bold">
                      {hoveredData?.state_utilization_pct?.toFixed(1) || '0.0'}%
                    </strong>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Works Built:</span>
                    <strong className="text-slate-800">
                      {hoveredData?.total_completed_works?.toLocaleString() || 0}
                    </strong>
                  </div>
                </div>

                <div className="pt-1 text-[9px] font-mono text-slate-400 text-center border-t border-slate-100">
                  Click state to lock dossier
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right (4-5 cols): Live State Intelligence Rail */}
        <div className="lg:col-span-4 space-y-4">
          {activeDossierData ? (
            /* Selected State Intelligence Dossier */
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-xs space-y-4">
              <div className="flex items-start justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold text-blue-600 uppercase">
                    SELECTED STATE DOSSIER
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-0.5">
                    {activeDossierData.state}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleResetZoom}
                  className="p-1 rounded-full hover:bg-white text-slate-400 hover:text-slate-900 border border-slate-200 transition"
                  title="Close State View"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Progress & Utilization */}
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-500">Fund Utilization</span>
                  <strong className="text-blue-700 font-black">
                    {activeDossierData.state_utilization_pct.toFixed(1)}%
                  </strong>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    style={{ width: `${Math.min(100, activeDossierData.state_utilization_pct)}%` }}
                    className="h-full rounded-full bg-blue-600"
                  />
                </div>
              </div>

              {/* Core Metrics Grid */}
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-0.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Allocated</span>
                  <div className="text-sm font-black font-mono text-slate-900">
                    ₹{(activeDossierData.total_allocated_amount / 1e7).toFixed(2)} Cr
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-0.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Disbursed</span>
                  <div className="text-sm font-black font-mono text-emerald-600">
                    ₹{(activeDossierData.total_expenditure / 1e7).toFixed(2)} Cr
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-0.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Members</span>
                  <div className="text-sm font-black font-mono text-slate-900">
                    {activeDossierData.total_mps} MPs
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-0.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Works Built</span>
                  <div className="text-sm font-black font-mono text-emerald-700">
                    {activeDossierData.total_completed_works.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Action Link */}
              <button
                type="button"
                onClick={() => navigate(`/mps?state=${encodeURIComponent(activeDossierData.state)}`)}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <span>Inspect {activeDossierData.total_mps} State MPs →</span>
              </button>
            </div>
          ) : (
            /* National Geographic Leaderboard Rail */
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                <span className="text-xs font-mono font-bold text-slate-900 uppercase flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  TOP STATES ({activeMetricMeta.short})
                </span>
                <span className="text-[10px] font-mono text-slate-400 font-bold">RANK</span>
              </div>

              <div className="space-y-1.5">
                {topStates.map((st, idx) => (
                  <div
                    key={st.state}
                    onClick={() => handleStateClick(st.state)}
                    className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 cursor-pointer transition flex items-center justify-between text-xs group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-100 font-mono font-bold text-[10px] text-slate-600 flex items-center justify-center">
                        0{idx + 1}
                      </span>
                      <div>
                        <div className="font-bold text-slate-900 group-hover:text-blue-600 transition truncate max-w-[120px]">
                          {st.state}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">{st.total_mps} MPs</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-black text-blue-600 text-xs">
                        {selectedMetric === 'UTILIZATION'
                          ? `${st.state_utilization_pct.toFixed(1)}%`
                          : selectedMetric === 'ALLOCATION'
                          ? `₹${(st.total_allocated_amount / 1e7).toFixed(0)} Cr`
                          : selectedMetric === 'EXPENDITURE'
                          ? `₹${(st.total_expenditure / 1e7).toFixed(0)} Cr`
                          : selectedMetric === 'COMPLETED_WORKS'
                          ? `${st.total_completed_works.toLocaleString()} wks`
                          : `${st.total_mps} MPs`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-1 text-center text-[11px] text-slate-500 font-medium">
                Hold cursor on any state to preview data · Click to inspect.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Modal */}
      <FollowTheMoneyModal isOpen={followMoneyModalOpen} onClose={() => setFollowMoneyModalOpen(false)} />
    </div>
  );
};
