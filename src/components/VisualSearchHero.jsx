import React, { useRef, useState } from 'react';
import { Camera, Upload, Sparkles, RefreshCw, Layers, Scissors, ShieldCheck, ExternalLink, Zap } from 'lucide-react';
import { analyzeOutfitImage } from '../services/visionService';
import { removeBackgroundFromImage, sliceOutfitGarments } from '../services/bgRemovalService';

export default function VisualSearchHero({ onVisionScanResult, onBuyWithPrava, onOpenMixMatchStudio, onAddNewProductToCatalog }) {
  const [isScanning, setIsScanning] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [cutoutImage, setCutoutImage] = useState(null);
  const [garmentSlices, setGarmentSlices] = useState([]);
  const [selectedSliceId, setSelectedSliceId] = useState(null);
  const [viewMode, setViewMode] = useState('cutout'); // 'cutout' or 'original'
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [matchedResults, setMatchedResults] = useState([]);
  const [activeVisionData, setActiveVisionData] = useState(null);
  const [webMatchProduct, setWebMatchProduct] = useState(null);
  const [scanStep, setScanStep] = useState(null); // 'analyzing' | 'removing' | 'matching'

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch { snapMock(); }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth || 640;
      canvasRef.current.height = videoRef.current.videoHeight || 480;
      ctx.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvasRef.current.toDataURL('image/jpeg');
      setPreviewImage(dataUrl);
      stopCamera();
      runScan(dataUrl);
    } else { snapMock(); }
  };

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreviewImage(ev.target.result);
      runScan(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const snapMock = () => {
    const url = 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80';
    setPreviewImage(url);
    setIsCameraActive(false);
    runScan(url);
  };

  const runScan = async (img) => {
    setIsScanning(true);
    setScanStep('analyzing');
    const matchPromise = analyzeOutfitImage(img);
    matchPromise
      .then((fastRes) => {
        if (!fastRes?.success) return;
        setActiveVisionData(fastRes.visionData);
        setMatchedResults(fastRes.matchedProducts || []);
        setWebMatchProduct(fastRes.webDiscoveredProduct);

        if (fastRes.webDiscoveredProduct && onAddNewProductToCatalog) {
          onAddNewProductToCatalog(fastRes.webDiscoveredProduct);
        }
      })
      .catch((err) => console.warn("Fast outfit web match failed:", err.message));
    
    // Step 1: GPT 5.6 SOL Vision analyzes person photo → GPT-IMAGE-1 generates clean dress product shot
    setScanStep('removing');
    const pngCutout = await removeBackgroundFromImage(img);
    setCutoutImage(pngCutout);

    // Step 2: Multi-Garment Slicing
    const slices = await sliceOutfitGarments(img, pngCutout);
    setGarmentSlices(slices);
    if (slices.length > 0) setSelectedSliceId(slices[0].id);

    // Step 3: GPT 5.6 SOL Vision Web Search → Discover exact match dress over internet
    setScanStep('matching');
    const initialRes = await matchPromise;
    const res = withCutoutResult(initialRes, pngCutout);
    setIsScanning(false);
    setScanStep(null);

    if (res.success) {
      setActiveVisionData(res.visionData);
      setMatchedResults(res.matchedProducts || []);
      setWebMatchProduct(res.webDiscoveredProduct);

      // Add newly discovered exact web dress to main store catalog dynamically
      if (res.webDiscoveredProduct && onAddNewProductToCatalog) {
        onAddNewProductToCatalog(res.webDiscoveredProduct);
      }

      onVisionScanResult({
        ...res.visionData,
        originalImage: img,
        cutoutImage: pngCutout,
        garmentSlices: slices,
        matchedProducts: res.matchedProducts,
        webDiscoveredProduct: res.webDiscoveredProduct
      });
    }
  };

  const handleSliceClick = (slice) => {
    setSelectedSliceId(slice.id);
  };

  const withCutoutResult = (res, pngCutout) => {
    if (!res?.success || !pngCutout || !res.webDiscoveredProduct) return res;

    const product = {
      ...res.webDiscoveredProduct,
      imageUrl: pngCutout,
    };

    return {
      ...res,
      webDiscoveredProduct: product,
      matchedProducts: [product, ...(res.matchedProducts || []).filter((p) => p.id !== product.id)],
    };
  };

  const resetScanner = () => {
    setPreviewImage(null);
    setCutoutImage(null);
    setGarmentSlices([]);
    setSelectedSliceId(null);
    setIsCameraActive(false);
    setIsScanning(false);
    setMatchedResults([]);
    setActiveVisionData(null);
    setWebMatchProduct(null);
  };

  return (
    <section className="relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #7C3AED 0%, #4F46E5 40%, #3B1D8E 100%)' }}>
      {/* Background Glow Orbs */}
      <div className="absolute top-10 left-[10%] w-40 h-40 bg-violet-400/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-10 right-[15%] w-60 h-60 bg-amber-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />

      <div className="relative max-w-7xl mx-auto px-4 lg:px-6 py-10 lg:py-16 space-y-8">
        
        {/* Top Header Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* Left: Headline & Actions */}
          <div className="lg:col-span-7 space-y-5 animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 font-bold text-xs backdrop-blur-sm">
              <Zap className="w-3.5 h-3.5" />
              Powered by OpenAI Vision, GPT Image & Prava Checkout
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-[52px] font-extrabold text-white leading-[1.05] tracking-tight">
              See an Outfit You Love?{' '}
              <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">Snap It. Isolate It. Shop It.</span>
            </h1>

            <p className="text-violet-200 text-sm sm:text-base max-w-xl leading-relaxed">
              Upload a photo or use the camera to capture any outfit. SnapFit isolates the clothing from the person, turns it into a clean product-style image, then surfaces item details, estimated pricing, similar matches, and secure Prava checkout.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <button onClick={startCamera} className="btn-gold py-3.5 px-7 text-[15px]">
                <Camera className="w-5 h-5 text-violet-900" /> Use Camera
              </button>
              <label className="btn-primary bg-white/15 backdrop-blur-sm border border-white/20 hover:bg-white/25 py-3.5 px-7 text-[15px] cursor-pointer shadow-none">
                <Upload className="w-5 h-5" /> Upload Outfit Photo
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
              </label>
            </div>

            {/* Feature Badges */}
            <div className="flex flex-wrap items-center gap-4 pt-2 text-violet-300 text-xs font-medium">
              {[
                { icon: Scissors, text: 'Person removed, outfit preserved' },
                { icon: Zap, text: 'Product details and price estimate' },
                { icon: ShieldCheck, text: 'Secure checkout with Prava' },
              ].map(b => (
                <div key={b.text} className="flex items-center gap-1.5">
                  <b.icon className="w-4 h-4 text-amber-400" />
                  <span>{b.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Vision Scanner & Interactive Cutout Card */}
          <div className="lg:col-span-5 animate-slide-right">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-amber-400/50 relative">

              <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-violet-50 to-indigo-50 border-b border-violet-100">
                <span className="flex items-center gap-2 text-violet-700 font-bold text-[13px]">
                  <Scissors className="w-4 h-4 text-amber-600" /> Outfit Intelligence Scanner
                </span>
                <div className="flex items-center gap-1">
                  {previewImage && cutoutImage && (
                    <div className="flex bg-violet-100 p-0.5 rounded-lg border border-violet-200 text-[10px]">
                      <button
                        onClick={() => setViewMode('cutout')}
                        className={`px-2 py-0.5 rounded font-bold transition-all ${viewMode === 'cutout' ? 'bg-violet-600 text-white shadow' : 'text-violet-700 hover:text-violet-900'}`}
                      >
                        Outfit Only
                      </button>
                      <button
                        onClick={() => setViewMode('original')}
                        className={`px-2 py-0.5 rounded font-bold transition-all ${viewMode === 'original' ? 'bg-violet-600 text-white shadow' : 'text-violet-700 hover:text-violet-900'}`}
                      >
                        Person Photo
                      </button>
                    </div>
                  )}
                  <span className="badge badge-prava text-[10px]">OPENAI</span>
                </div>
              </div>

              <div className="p-4">
                {isCameraActive ? (
                  <div className="relative rounded-xl overflow-hidden bg-black aspect-[4/3]">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    <div className="absolute inset-4 border-2 border-amber-400/50 rounded-lg pointer-events-none">
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-3 border-l-3 border-amber-400 rounded-tl-lg" />
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-3 border-r-3 border-amber-400 rounded-tr-lg" />
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-3 border-l-3 border-amber-400 rounded-bl-lg" />
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-3 border-r-3 border-amber-400 rounded-br-lg" />
                    </div>
                    <button onClick={capturePhoto} className="absolute bottom-4 left-1/2 -translate-x-1/2 btn-gold py-2.5 px-6 text-sm shadow-lg">
                      <Camera className="w-4 h-4 text-violet-900" /> Capture Outfit
                    </button>
                  </div>
                ) : previewImage ? (
                  <div className="space-y-3">
                    <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-gray-100 flex items-center justify-center">
                      {viewMode === 'cutout' && (
                        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:12px_12px]" />
                      )}

                      <img
                        src={viewMode === 'cutout' ? (cutoutImage || previewImage) : previewImage}
                        alt="Outfit Preview"
                        className="relative z-10 max-h-full max-w-full object-contain p-2 transition-all duration-300"
                      />

                      {isScanning && (
                        <div className="absolute inset-0 z-20 bg-violet-900/85 backdrop-blur-sm flex flex-col items-center justify-center text-white gap-3 p-4 text-center">
                          <RefreshCw className="w-10 h-10 text-amber-400 animate-spin" />
                          {scanStep === 'analyzing' && (
                            <>
                              <p className="font-bold text-sm">Analyzing outfit details...</p>
                              <p className="text-violet-200 text-xs">Reading color, fabric, silhouette, and category</p>
                            </>
                          )}
                          {scanStep === 'removing' && (
                            <>
                              <p className="font-bold text-sm">Creating a clean product image...</p>
                              <p className="text-violet-200 text-xs">Removing the person while preserving the garment</p>
                            </>
                          )}
                          {scanStep === 'matching' && (
                            <>
                              <p className="font-bold text-sm">Finding shoppable matches...</p>
                              <p className="text-violet-200 text-xs">Preparing item name, price, merchants, and alternatives</p>
                            </>
                          )}
                          {!scanStep && (
                            <>
                              <p className="font-bold text-sm">Processing outfit photo...</p>
                              <p className="text-violet-200 text-xs">Preparing your outfit match</p>
                            </>
                          )}
                        </div>
                      )}

                      {!isScanning && (
                        <button onClick={resetScanner} className="absolute top-3 right-3 z-30 px-3 py-1.5 rounded-lg bg-white/90 text-violet-700 text-xs font-bold shadow-md hover:bg-white">
                          New Scan
                        </button>
                      )}
                    </div>

                    {/* Extracted Outfit Pieces */}
                    {garmentSlices.length > 0 && !isScanning && (
                      <div className="bg-violet-50/80 p-3 rounded-xl border border-violet-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-extrabold text-violet-900 uppercase tracking-wider flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-violet-600" /> Isolated Outfit
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {garmentSlices.map((slice) => (
                            <button
                              key={slice.id}
                              onClick={() => handleSliceClick(slice)}
                              className={`p-1.5 rounded-lg border text-center flex flex-col items-center gap-1 transition-all ${selectedSliceId === slice.id ? 'bg-violet-600 border-amber-400 text-white shadow-md' : 'bg-white border-violet-200 text-violet-800 hover:border-violet-400'}`}
                            >
                              <div className="w-10 h-10 rounded bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-200 p-0.5">
                                <img src={slice.cutoutUrl} alt={slice.label} className="max-h-full max-w-full object-contain" />
                              </div>
                              <span className="text-[9px] font-bold truncate max-w-full">{slice.id.toUpperCase()}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <button onClick={() => fileInputRef.current?.click()} className="w-full aspect-[4/3] rounded-xl border-2 border-dashed border-violet-200 bg-violet-50/50 hover:border-violet-400 hover:bg-violet-50 transition-all flex flex-col items-center justify-center gap-3 cursor-pointer">
                    <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center group-hover:bg-violet-200 transition-colors">
                      <Scissors className="w-8 h-8 text-violet-600" />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-violet-700 text-sm">Upload a photo with a visible outfit</p>
                      <p className="text-violet-400 text-xs font-mono mt-1">OpenAI-powered extraction and visual matching</p>
                    </div>
                  </button>
                )}
              </div>

              <canvas ref={canvasRef} className="hidden" />
            </div>
          </div>
        </div>

        {/* Web Discovered Exact Match Dress Card Row */}
        {webMatchProduct && (
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border-2 border-amber-400/60 space-y-5 animate-fade-up shadow-2xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/20 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-400 text-violet-950 font-extrabold text-[11px] uppercase tracking-wider mb-1 shadow-md">
                  <Zap className="w-3.5 h-3.5" /> OUTFIT MATCH READY TO SHOP
                </div>
                <h3 className="text-2xl font-extrabold text-white">{webMatchProduct.name}</h3>
                <p className="text-amber-200 text-xs mt-0.5 font-mono">Matched by OpenAI Vision · person removed, outfit preserved</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => onBuyWithPrava(webMatchProduct, 'M')}
                  className="btn-gold py-3 px-6 text-sm font-extrabold flex items-center gap-2 shadow-xl hover:scale-105 transition-transform"
                >
                  <ShieldCheck className="w-5 h-5 text-violet-900" /> Buy with Prava (₹{webMatchProduct.price.toLocaleString('en-IN')})
                </button>
              </div>
            </div>

            {/* Product Feature Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-white/15 p-5 rounded-2xl border border-white/20 items-center">
              {/* Isolated Dress Cutout PNG Display */}
              <div className="md:col-span-4 aspect-square rounded-2xl bg-white/20 backdrop-blur-sm p-4 flex items-center justify-center border border-white/30 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:10px_10px]" />
                <img src={webMatchProduct.imageUrl} alt={webMatchProduct.name} className="max-h-full max-w-full object-contain relative z-10 filter drop-shadow-2xl" />
                <span className="absolute bottom-2 left-2 bg-slate-900/80 text-amber-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                  ISOLATED OUTFIT IMAGE
                </span>
              </div>

              {/* Specs & Buy Buttons */}
              <div className="md:col-span-8 space-y-4 text-white">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white/10 border border-white/15">
                    <p className="text-amber-300 font-bold text-[10px] uppercase">Likely Brand</p>
                    <p className="font-extrabold text-sm mt-0.5">{webMatchProduct.brand}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/10 border border-white/15">
                    <p className="text-amber-300 font-bold text-[10px] uppercase">Estimated Price</p>
                    <p className="font-extrabold text-sm mt-0.5">₹{webMatchProduct.price.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/10 border border-white/15">
                    <p className="text-amber-300 font-bold text-[10px] uppercase">Checkout</p>
                    <p className="font-extrabold text-sm mt-0.5 text-emerald-300">Prava secured</p>
                  </div>
                </div>

                <p className="text-violet-100 text-xs leading-relaxed">
                  {webMatchProduct.description}
                </p>

                {activeVisionData?.buyOptions?.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeVisionData.buyOptions.slice(0, 5).map((option, index) => (
                      <a
                        key={`${option.label}-${index}`}
                        href={option.url || activeVisionData.buySearchUrl || webMatchProduct.purchaseUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between gap-3 rounded-xl bg-white/10 border border-white/15 px-3 py-2 text-xs text-white hover:bg-white/20 transition-colors"
                      >
                        <span className="min-w-0">
                          <span className="block font-extrabold truncate">{option.label}</span>
                          <span className="block text-amber-200 font-mono truncate">
                            {option.merchantDomain} · ₹{Number(option.estimatedPrice || webMatchProduct.price).toLocaleString('en-IN')}
                          </span>
                        </span>
                        <ExternalLink className="w-4 h-4 text-amber-300 flex-shrink-0" />
                      </a>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-3 pt-1">
                  <button
                    onClick={() => onBuyWithPrava(webMatchProduct, 'M')}
                    className="btn-gold py-3 px-6 text-xs font-extrabold flex items-center gap-2 shadow-lg"
                  >
                    <ShieldCheck className="w-4 h-4 text-violet-900" /> Pay ₹{webMatchProduct.price.toLocaleString('en-IN')} with Prava
                  </button>
                  <button
                    onClick={onOpenMixMatchStudio}
                    className="btn-primary bg-white/20 hover:bg-white/30 border border-white/30 py-3 px-5 text-xs font-bold flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" /> Try It On in Studio
                  </button>
                  <a
                    href={activeVisionData?.buySearchUrl || webMatchProduct.purchaseUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary bg-white/20 hover:bg-white/30 border border-white/30 py-3 px-5 text-xs font-bold flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4 text-amber-300" /> Search Web
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
