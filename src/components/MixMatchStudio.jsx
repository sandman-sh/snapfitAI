import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Sparkles, ShieldCheck, Layers, Camera, Upload, RefreshCw, CheckCircle2, Zap, ImageIcon, AlertCircle } from 'lucide-react';
import { generateAIVirtualTryOn } from '../services/aiTryOnService';

// ── Standing Full-Body Model Presets ──
const MODEL_PRESETS = [
  { id: 'woman_1', label: 'Woman', gender: 'Women', url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80' },
  { id: 'woman_2', label: 'Woman 2', gender: 'Women', url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80' },
  { id: 'man_1', label: 'Man', gender: 'Men', url: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=800&q=80' },
  { id: 'man_2', label: 'Man 2', gender: 'Men', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80' },
  { id: 'kid_1', label: 'Kid', gender: 'Kids', url: 'https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?auto=format&fit=crop&w=800&q=80' },
];

export default function MixMatchStudio({ isOpen, onClose, initialCutout, products, onCheckoutFullOutfit }) {
  const [studioMode, setStudioMode] = useState('ar_tryon');

  // AR Try-On State
  const [userPhoto, setUserPhoto] = useState(MODEL_PRESETS[0].url);
  const [activeModelId, setActiveModelId] = useState('woman_1');
  const [selectedGarment, setSelectedGarment] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isGeneratingTryOn, setIsGeneratingTryOn] = useState(false);
  const [tryOnResult, setTryOnResult] = useState(null);
  const [tryOnError, setTryOnError] = useState(null);
  const [showBeforeAfter, setShowBeforeAfter] = useState(false);
  const [sliderPos, setSliderPos] = useState(50);
  // Track the generation counter so we can discard stale results
  const genCounterRef = useRef(0);

  const videoRef = useRef(null);
  const cameraCanvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const sliderContainerRef = useRef(null);

  // 2D Canvas State
  const canvasRef = useRef(null);
  const [placedItems, setPlacedItems] = useState([
    {
      id: 'default_1', name: 'Tailored Linen Blazer', category: 'Outerwear',
      image: initialCutout || 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80',
      price: 24999, x: 35, y: 40, scale: 1, zIndex: 2,
    },
  ]);
  const [selectedItemId, setSelectedItemId] = useState('default_1');
  const [draggingId, setDraggingId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Set initial garment once products load
  useEffect(() => {
    if (products?.length > 0 && !selectedGarment) {
      setSelectedGarment(products[0]);
    }
  }, [products]);

  useEffect(() => {
    if (initialCutout) {
      setPlacedItems((prev) => [
        { id: `scanned_${Date.now()}`, name: 'Extracted Garment Cutout', category: 'Scanned Garment', image: initialCutout, price: 14999, x: 40, y: 60, scale: 1, zIndex: 10 },
        ...prev,
      ]);
    }
  }, [initialCutout]);

  // ── Core try-on function (stable via useCallback) ──
  const runAITryOn = useCallback(async (photo, garment) => {
    if (!garment || !photo) return;

    const myGen = ++genCounterRef.current;

    setIsGeneratingTryOn(true);
    setTryOnError(null);
    setTryOnResult(null);
    setShowBeforeAfter(false);

    try {
      const res = await generateAIVirtualTryOn({
        userPhoto: photo,
        selectedGarment: garment,
      });

      // Only apply if this is still the latest generation
      if (genCounterRef.current !== myGen) return;

      if (res?.success) {
        setTryOnResult(res);
      } else {
        setTryOnError("Try-on generation failed. Tap a garment to retry.");
      }
    } catch (err) {
      if (genCounterRef.current !== myGen) return;
      console.error("Try-on error:", err);
      setTryOnError("An error occurred. Tap a garment to retry.");
    } finally {
      if (genCounterRef.current === myGen) {
        setIsGeneratingTryOn(false);
      }
    }
  }, []);

  if (!isOpen) return null;

  // ═══════════════════════════════════════════════════════
  // Camera
  // ═══════════════════════════════════════════════════════

  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      setTryOnResult(null);
      setTryOnError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 960 } },
      });
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
    } catch {
      setIsCameraActive(false);
      setTryOnError("Camera access denied.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !cameraCanvasRef.current) return;
    const v = videoRef.current;
    const c = cameraCanvasRef.current;
    c.width = v.videoWidth || 640;
    c.height = v.videoHeight || 480;
    c.getContext('2d').drawImage(v, 0, 0, c.width, c.height);
    const dataUrl = c.toDataURL('image/png');
    setUserPhoto(dataUrl);
    setActiveModelId(null);
    stopCamera();
    if (selectedGarment) runAITryOn(dataUrl, selectedGarment);
  };

  const handleUploadPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setUserPhoto(dataUrl);
      setActiveModelId(null);
      setTryOnResult(null);
      if (selectedGarment) runAITryOn(dataUrl, selectedGarment);
    };
    reader.readAsDataURL(file);
  };

  // ═══════════════════════════════════════════════════════
  // Garment & Model selection
  // ═══════════════════════════════════════════════════════

  const handleSelectGarment = (g) => {
    setSelectedGarment(g);
    setTryOnResult(null);
    setShowBeforeAfter(false);
    runAITryOn(userPhoto, g);
  };

  const handleSelectModel = (model) => {
    setActiveModelId(model.id);
    setUserPhoto(model.url);
    setTryOnResult(null);
    setShowBeforeAfter(false);
    if (selectedGarment) runAITryOn(model.url, selectedGarment);
  };

  const handleRegenerate = () => {
    if (!selectedGarment || isGeneratingTryOn) return;
    runAITryOn(userPhoto, selectedGarment);
  };

  // Before/After slider
  const handleSliderMove = (e) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    setSliderPos(Math.max(0, Math.min(100, (x / rect.width) * 100)));
  };

  // 2D Canvas drag
  const handleMouseDown = (e, item) => {
    e.stopPropagation(); setSelectedItemId(item.id); setDraggingId(item.id);
    const r = canvasRef.current.getBoundingClientRect();
    setDragOffset({ x: e.clientX - r.left - item.x, y: e.clientY - r.top - item.y });
  };
  const handleMouseMove = (e) => {
    if (!draggingId || !canvasRef.current) return;
    const r = canvasRef.current.getBoundingClientRect();
    setPlacedItems(prev => prev.map(i => i.id === draggingId ? { ...i, x: e.clientX - r.left - dragOffset.x, y: e.clientY - r.top - dragOffset.y } : i));
  };
  const handleMouseUp = () => setDraggingId(null);
  const totalPrice = placedItems.reduce((a, c) => a + c.price, 0);

  // ═══════════════════════════════════════════════════════
  // Render
  // ═══════════════════════════════════════════════════════

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg animate-fade-in select-none">
      <div className="bg-[var(--sf-surface)] border border-[var(--sf-border)] rounded-3xl shadow-2xl max-w-[1100px] w-full overflow-hidden flex flex-col max-h-[94vh]">

        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--sf-border)] flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-violet-700 via-indigo-700 to-violet-900 text-white">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <h2 className="font-extrabold text-lg tracking-tight">AI Virtual Try-On Studio</h2>
          </div>
          <div className="flex bg-black/30 p-1 rounded-xl border border-white/10 text-xs font-extrabold">
            <button onClick={() => setStudioMode('ar_tryon')} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all ${studioMode === 'ar_tryon' ? 'bg-amber-400 text-violet-950 shadow-md' : 'text-violet-200 hover:text-white'}`}>
              <Camera className="w-4 h-4" /> AI Photo Try-On
            </button>
            <button onClick={() => setStudioMode('canvas_mannequin')} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all ${studioMode === 'canvas_mannequin' ? 'bg-amber-400 text-violet-950 shadow-md' : 'text-violet-200 hover:text-white'}`}>
              <Layers className="w-4 h-4" /> 2D Mannequin
            </button>
          </div>
          <button onClick={() => { stopCamera(); onClose(); }} className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"><X className="w-5 h-5" /></button>
        </div>

        {/* ═══════════════════════════════════════════════ */}
        {/* MODE 1: AI PHOTO TRY-ON                        */}
        {/* ═══════════════════════════════════════════════ */}
        {studioMode === 'ar_tryon' && (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">

            {/* Left: Canvas */}
            <div className="lg:col-span-8 bg-slate-950 relative flex flex-col min-h-[480px] border-r border-[var(--sf-border)] overflow-hidden">

              {/* Top Controls */}
              <div className="w-full flex flex-wrap justify-between items-center gap-2 px-4 pt-3 pb-2 z-20">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="badge badge-prava text-[10px] uppercase tracking-wider flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" /> AI Try-On
                  </span>
                  {tryOnResult && (
                    <span className="text-[11px] text-emerald-400 font-mono font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                      Fit: {tryOnResult.fitMatchScore}%
                    </span>
                  )}
                  {tryOnResult?.isRealAI && (
                    <span className="text-[10px] text-cyan-300 font-mono bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">✦ AI Generated</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={startCamera} className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition-all">
                    <Camera className="w-3.5 h-3.5" /> Camera
                  </button>
                  <label className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-slate-700 transition-all">
                    <Upload className="w-3.5 h-3.5" /> Upload
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUploadPhoto} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Model selector */}
              <div className="flex items-center gap-1.5 px-4 pb-2 flex-wrap">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mr-0.5">Model:</span>
                {MODEL_PRESETS.map((m) => (
                  <button key={m.id} onClick={() => handleSelectModel(m)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${activeModelId === m.id ? 'bg-amber-400 text-violet-950 shadow ring-1 ring-amber-300' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700'}`}>
                    {m.label}
                  </button>
                ))}
              </div>

              {/* ── Main Viewport ── */}
              <div className="relative flex-1 mx-4 mb-2 rounded-2xl overflow-hidden bg-black border border-slate-800 flex items-center justify-center min-h-[300px]">

                {isCameraActive ? (
                  <div className="relative w-full h-full">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
                      <button onClick={capturePhoto} className="btn-gold py-3 px-6 text-xs font-extrabold shadow-xl flex items-center gap-2 animate-pulse">
                        <Camera className="w-4 h-4 text-violet-950" /> Snap & Try On
                      </button>
                      <button onClick={stopCamera} className="py-2.5 px-4 rounded-xl bg-red-600/80 text-white text-xs font-bold">Cancel</button>
                    </div>
                  </div>

                ) : isGeneratingTryOn ? (
                  <div className="absolute inset-0 bg-gradient-to-b from-violet-950/90 to-slate-950/95 backdrop-blur-md z-30 flex flex-col items-center justify-center text-white gap-4">
                    <div className="relative">
                      <RefreshCw className="w-14 h-14 text-amber-400 animate-spin" />
                    </div>
                    <p className="font-extrabold text-sm">Fitting {selectedGarment?.name || 'style'} onto model...</p>
                    <p className="text-violet-300 text-[11px] font-mono">Aligning garment, lighting, and fit</p>
                    {/* Show which garment is being fitted */}
                    {selectedGarment && (
                      <div className="flex items-center gap-3 mt-2 bg-slate-900/60 rounded-xl p-2 border border-slate-700">
                        <img src={selectedGarment.imageUrl || selectedGarment.image} alt="" className="w-12 h-12 rounded-lg object-contain bg-white" />
                        <div>
                          <p className="text-[11px] font-bold text-white">{selectedGarment.name}</p>
                          <p className="text-[10px] text-amber-400 font-mono">₹{selectedGarment.price?.toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                  </div>

                ) : showBeforeAfter && tryOnResult ? (
                  <div ref={sliderContainerRef} className="relative w-full h-full cursor-col-resize" onMouseMove={handleSliderMove} onTouchMove={handleSliderMove}>
                    <img src={userPhoto} alt="Before" className="absolute inset-0 w-full h-full object-contain" />
                    <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPos}%` }}>
                      <img src={tryOnResult.tryOnImageUrl} alt="After" className="w-full h-full object-contain" style={{ minWidth: sliderContainerRef.current?.offsetWidth || '100%' }} />
                    </div>
                    <div className="absolute top-0 bottom-0 w-0.5 bg-amber-400" style={{ left: `${sliderPos}%` }}>
                      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center shadow-xl"><span className="text-violet-950 text-sm font-black">⇔</span></div>
                    </div>
                  </div>

                ) : tryOnResult ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img src={tryOnResult.tryOnImageUrl} alt="Virtual Try-On" className="max-h-full max-w-full object-contain" />
                    {/* Garment badge floating */}
                    {selectedGarment && (
                      <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-xl p-2 border border-white/10">
                        <img src={selectedGarment.imageUrl || selectedGarment.image} alt="" className="w-8 h-8 rounded-md object-contain bg-white" />
                        <span className="text-[10px] text-white font-bold max-w-[140px] truncate">{selectedGarment.name}</span>
                      </div>
                    )}
                    <button onClick={() => setShowBeforeAfter(true)}
                      className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg backdrop-blur-sm flex items-center gap-1 transition-all">
                      <ImageIcon className="w-3 h-3" /> Before / After
                    </button>
                  </div>

                ) : tryOnError ? (
                  <div className="flex flex-col items-center justify-center text-center gap-3 p-6">
                    <AlertCircle className="w-10 h-10 text-red-400" />
                    <p className="text-red-300 text-sm font-bold">{tryOnError}</p>
                    <button onClick={handleRegenerate} className="btn-gold py-2 px-4 text-xs font-extrabold mt-2">Retry</button>
                  </div>

                ) : (
                  /* Default: model photo with prompt to select garment */
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img src={userPhoto} alt="Model" className="max-h-full max-w-full object-contain" />
                    <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center gap-3">
                      <p className="text-white/80 text-sm font-bold text-center px-8">
                        {selectedGarment ? `Tap "Generate Try-On" to fit ${selectedGarment.name}` : '← Select an outfit to try on'}
                      </p>
                      {selectedGarment && (
                        <button onClick={handleRegenerate} className="btn-gold py-2.5 px-5 text-xs font-extrabold flex items-center gap-2 shadow-xl">
                          <Sparkles className="w-4 h-4 text-violet-950" /> Generate Try-On
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom bar: selected garment + regenerate */}
              <div className="px-4 pb-3 flex flex-wrap justify-between items-center gap-2">
                {selectedGarment && (
                  <>
                    <div className="flex items-center gap-2 text-xs">
                      <img src={selectedGarment.imageUrl || selectedGarment.image} alt="" className="w-7 h-7 rounded-md object-contain bg-white border" />
                      <div>
                        <span className="text-amber-400 font-extrabold text-[10px]">TRY-ON LOOK:</span>
                        <span className="font-bold text-white ml-1 truncate max-w-[180px] inline-block align-middle">{selectedGarment.name}</span>
                      </div>
                    </div>
                    <button onClick={handleRegenerate} disabled={isGeneratingTryOn}
                      className="btn-gold py-2 px-4 text-xs font-extrabold flex items-center gap-1.5 shadow disabled:opacity-50 disabled:cursor-not-allowed">
                      <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingTryOn ? 'animate-spin' : ''}`} />
                      {isGeneratingTryOn ? 'Generating...' : 'Regenerate'}
                    </button>
                  </>
                )}
              </div>

              <canvas ref={cameraCanvasRef} className="hidden" />
            </div>

            {/* Right: Garment Grid */}
            <div className="lg:col-span-4 p-5 flex flex-col justify-between bg-[var(--sf-surface)] overflow-y-auto space-y-4">
              <div className="space-y-3">
                <h3 className="font-extrabold text-sm text-[var(--sf-text)] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" /> Select Outfit to Try On
                </h3>
                <div className="grid grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {products?.map((prod) => {
                    const isSelected = selectedGarment?.id === prod.id;
                    return (
                      <button key={prod.id} onClick={() => handleSelectGarment(prod)} disabled={isGeneratingTryOn}
                        className={`p-2.5 rounded-2xl border text-left flex flex-col gap-1.5 transition-all ${isSelected ? 'border-amber-400 bg-amber-500/10 ring-2 ring-amber-400/50 shadow-md' : 'border-[var(--sf-border)] bg-[var(--sf-surface-alt)] hover:border-violet-400'} ${isGeneratingTryOn ? 'opacity-60 cursor-not-allowed' : ''}`}>
                        <div className="aspect-square rounded-xl overflow-hidden bg-white border p-1 relative">
                          <img src={prod.imageUrl || prod.image} alt={prod.name} className="w-full h-full object-contain" />
                          {isSelected && (
                            <span className="absolute top-1 right-1 bg-amber-400 text-violet-950 p-1 rounded-full shadow"><CheckCircle2 className="w-3.5 h-3.5" /></span>
                          )}
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-[var(--sf-text)] line-clamp-1">{prod.name}</p>
                          <div className="flex items-center justify-between mt-0.5">
                            <p className="text-[10px] font-mono text-violet-600 font-extrabold">₹{prod.price?.toLocaleString()}</p>
                            <span className="text-[9px] text-slate-500 font-bold">{prod.gender}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedGarment && (
                <div className="pt-4 border-t border-[var(--sf-border)] space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-[var(--sf-text-muted)]">Price</span>
                    <span className="font-mono font-extrabold text-xl text-violet-600 dark:text-violet-400">₹{selectedGarment.price?.toLocaleString()}</span>
                  </div>
                  <button onClick={() => { onCheckoutFullOutfit(selectedGarment); onClose(); }}
                    className="w-full btn-gold py-3.5 px-4 text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg">
                    <ShieldCheck className="w-5 h-5 text-violet-950" /> Buy with Prava
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════ */}
        {/* MODE 2: 2D DRAG CANVAS                         */}
        {/* ═══════════════════════════════════════════════ */}
        {studioMode === 'canvas_mannequin' && (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
            <div ref={canvasRef} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}
              className="lg:col-span-8 bg-slate-950 relative p-4 flex items-center justify-center min-h-[460px] border-r border-[var(--sf-border)] overflow-hidden cursor-crosshair">
              <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:20px_20px]" />
              <div className="relative w-80 h-[440px] rounded-3xl border-2 border-dashed border-violet-500/40 flex items-center justify-center bg-violet-900/10">
                <div className="text-center text-violet-400/40 pointer-events-none select-none">
                  <div className="w-24 h-24 rounded-full border-2 border-violet-500/30 mx-auto mb-3 flex items-center justify-center">
                    <span className="text-xs font-mono font-bold tracking-widest text-violet-400">AVATAR</span>
                  </div>
                  <p className="text-xs font-extrabold uppercase tracking-widest text-violet-300">2D Mannequin Canvas</p>
                </div>
                {placedItems.map((item) => (
                  <div key={item.id} onMouseDown={(e) => handleMouseDown(e, item)}
                    style={{ position: 'absolute', left: `${item.x}px`, top: `${item.y}px`, transform: `scale(${item.scale})`, zIndex: item.zIndex }}
                    className="cursor-grab active:cursor-grabbing p-2 rounded-2xl ring-1 ring-amber-400/50">
                    <img src={item.image} alt={item.name} className="max-h-52 max-w-52 object-contain pointer-events-none drop-shadow-2xl" />
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-4 p-5 flex flex-col justify-between bg-[var(--sf-surface)] overflow-y-auto space-y-4">
              <div className="space-y-3">
                <h3 className="font-extrabold text-sm text-[var(--sf-text)]">Outfit Bundle ({placedItems.length})</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {placedItems.map((item) => (
                    <div key={item.id} className="p-2 rounded-xl border flex items-center justify-between text-xs">
                      <span className="font-bold truncate">{item.name}</span>
                      <span className="font-mono text-violet-600">₹{item.price?.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={() => { onCheckoutFullOutfit({ id: `bundle_${Date.now()}`, title: 'Outfit Bundle', price: totalPrice }); onClose(); }}
                className="w-full btn-gold py-3.5 text-sm font-extrabold shadow-lg">
                Buy Bundle (₹{totalPrice.toLocaleString()})
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
