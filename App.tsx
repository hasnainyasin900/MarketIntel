import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, DollarSign, CheckCircle2, 
  Loader2, SearchCode, MessageSquare, X,
  Rocket, Mic, Volume2, FileSearch, Sparkles, Image as ImageIcon,
  Download, Upload, Info, Target, Zap, Award, Activity,
  ChevronRight, BarChart, Bot, Send, Clock, Tag, MousePointer2,
  Share2, Layers, Globe, Wallet, Users, Compass, AlertCircle,
  Facebook, Instagram, LayoutDashboard, TrendingUp, Filter
} from 'lucide-react';
import { 
  generateProductReport, chatWithPro, 
  generateImage, analyzeMedia, generateTTS, generateProductAd, enhancePrompt
} from './geminiService';
import { 
  ProductReport, SearchParams, ChatMessage, AspectRatio
} from './types';

export default function App() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<(ProductReport & { sources?: any[] }) | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  
  const [tab, setTab] = useState<'strategy' | 'creative' | 'insights' | 'audio'>('strategy');
  const [mode, setMode] = useState<'discover' | 'analyze'>('discover');
  
  // Creative
  const [genPrompt, setGenPrompt] = useState("");
  const [genRatio, setGenRatio] = useState<AspectRatio>('1:1');
  const [genResult, setGenResult] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [creativeMode, setCreativeMode] = useState<'standard' | 'productAd'>('standard');
  const [productPhoto, setProductPhoto] = useState<string | null>(null);

  // Analysis
  const [analysisPrompt, setAnalysisPrompt] = useState("");
  const [analysisResult, setAnalysisResult] = useState("");
  const [analysisFile, setAnalysisFile] = useState<string | null>(null);
  const [analysisMime, setAnalysisMime] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Audio
  const [ttsInput, setTtsInput] = useState("");
  const [isTtsPlaying, setIsTtsPlaying] = useState(false);

  const [formData, setFormData] = useState<SearchParams>({
    productName: '',
    region: '',
    budgetRange: '',
    experienceLevel: 'Beginner',
  });

  const chatEndRef = useRef<HTMLDivElement>(null);
  const analysisInputRef = useRef<HTMLInputElement>(null);
  const creativeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setReport(null);
    try {
      const data = await generateProductReport(formData);
      setReport(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = { role: 'user', text: chatInput } as ChatMessage;
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setIsChatLoading(true);
    try {
      const response = await chatWithPro(chatInput);
      setChatMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'model', text: "Service busy. Try again." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleCreativeGen = async () => {
    if (!genPrompt) return;
    setIsGenerating(true);
    setError(null);
    try {
      let res;
      if (creativeMode === 'productAd') {
        if (!productPhoto) throw new Error("Please upload a product photo.");
        const base64 = productPhoto.split(',')[1];
        res = await generateProductAd(base64, genPrompt);
      } else {
        const enhanced = await enhancePrompt(genPrompt);
        res = await generateImage(enhanced, genRatio);
      }
      setGenResult(res);
    } catch (err: any) { setError(err.message); } finally { setIsGenerating(false); }
  };

  const handleAnalysis = async () => {
    if (!analysisFile || !analysisPrompt) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const base64 = analysisFile.split(',')[1];
      const res = await analyzeMedia(base64, analysisMime, analysisPrompt);
      setAnalysisResult(res);
    } catch (err: any) { setError(err.message); } finally { setIsAnalyzing(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans selection:bg-blue-100 overflow-x-hidden">
      <nav className="bg-white/80 backdrop-blur-xl border-b sticky top-0 z-50 px-4 md:px-8 py-4 transition-all shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-200">
              <Rocket className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tighter">Market<span className="text-blue-600">Intel</span></h1>
          </div>
          <div className="flex gap-3 md:gap-6 items-center">
            <div className="hidden lg:flex bg-slate-100 p-1 rounded-xl">
              {(['strategy', 'creative', 'insights', 'audio'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)} className={`px-5 py-2 rounded-lg text-xs font-bold transition-all capitalize ${tab === t ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>{t}</button>
              ))}
            </div>
            <button onClick={() => setIsChatOpen(!isChatOpen)} className="bg-slate-900 text-white px-5 py-2 rounded-xl font-bold text-xs md:text-sm shadow-xl hover:bg-black transition-all">Growth AI</button>
          </div>
        </div>
      </nav>

      {/* Mobile Tab Bar */}
      <div className="lg:hidden flex bg-white border-b px-4 py-3 gap-2 overflow-x-auto no-scrollbar scroll-smooth">
        {(['strategy', 'creative', 'insights', 'audio'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`whitespace-nowrap px-5 py-2 rounded-full text-xs font-bold transition-all capitalize flex-shrink-0 ${tab === t ? 'bg-blue-600 text-white shadow-md shadow-blue-100' : 'bg-slate-100 text-slate-500'}`}>{t}</button>
        ))}
      </div>

      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-8 md:pt-16">
        {tab === 'strategy' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-500">
            {/* Simple Modern Input */}
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-8 md:p-12 relative overflow-hidden ring-1 ring-slate-100/50">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-10">
                <div className="space-y-2 text-center md:text-left">
                  <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900">Intelligence Hub</h2>
                  <p className="text-slate-400 font-medium">Simple analysis for complex Meta Ads campaigns.</p>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-2xl w-full md:w-fit">
                  <button onClick={() => setMode('discover')} className={`flex-1 md:flex-none px-8 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all ${mode === 'discover' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>Discover</button>
                  <button onClick={() => setMode('analyze')} className={`flex-1 md:flex-none px-8 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all ${mode === 'analyze' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>Deep Analysis</button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                {mode === 'analyze' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Product Name</label>
                    <div className="relative">
                      <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                      <input required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-12 pr-6 py-4 text-base font-bold focus:border-blue-500 transition-all outline-none" value={formData.productName} onChange={e => setFormData({...formData, productName: e.target.value})} placeholder="e.g. WiFi Camera" />
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Target Region</label>
                  <div className="relative">
                    <Globe className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <input className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-12 pr-6 py-4 text-base font-bold focus:border-blue-500 transition-all outline-none" value={formData.region} onChange={e => setFormData({...formData, region: e.target.value})} placeholder="e.g. Pakistan" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Budget Range</label>
                  <div className="relative">
                    <Wallet className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <input className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-12 pr-6 py-4 text-base font-bold focus:border-blue-500 transition-all outline-none" value={formData.budgetRange} onChange={e => setFormData({...formData, budgetRange: e.target.value})} placeholder="e.g. $1000" />
                  </div>
                </div>
                <button disabled={loading} className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-[0.98] flex items-center justify-center gap-3">
                  {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <><Sparkles className="w-5 h-5"/> Synthesize</>}
                </button>
              </form>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-100 p-6 rounded-2xl flex items-center gap-4 animate-in slide-in-from-top-2">
                <AlertCircle className="w-6 h-6 text-rose-500 shrink-0" />
                <p className="text-rose-700 font-medium">{error}</p>
              </div>
            )}

            {report && (
              <div className="space-y-16 animate-in zoom-in-95 duration-700">
                {/* Product Hero */}
                <div className="text-center space-y-6">
                  <div className="inline-flex px-5 py-2 bg-blue-50 text-blue-600 rounded-full text-[11px] font-black uppercase tracking-widest border border-blue-100 shadow-sm">Current Focus</div>
                  <h1 className="text-5xl md:text-8xl font-black text-slate-950 tracking-tighter leading-none break-words uppercase">
                    {formData.productName || "Smart Product"}
                  </h1>
                  <p className="text-xl md:text-2xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">{report.overview.explanation}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Meta Ads Intelligence */}
                  <div className="lg:col-span-2 space-y-8">
                    <section className="bg-white p-8 md:p-12 rounded-[3rem] shadow-sm border border-slate-100 space-y-10">
                      <div className="flex items-center gap-6">
                        <div className="bg-blue-600 p-4 rounded-2xl shadow-lg shadow-blue-100">
                          <Facebook className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Meta Ads Targeting</h2>
                          <p className="text-slate-400 font-bold uppercase text-[11px] tracking-widest mt-1">Intelligence Layer</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <h3 className="text-sm font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                            <Target className="w-4 h-4" /> Core Interests
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {report.metaAds.targeting.specificAudienceInterests.map((interest, i) => (
                              <span key={i} className="px-4 py-2 bg-slate-50 text-slate-700 rounded-xl text-xs font-bold border border-slate-100">{interest}</span>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-4">
                          <h3 className="text-sm font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                            <Users className="w-4 h-4" /> LAL Strategy
                          </h3>
                          <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100">
                            <p className="text-blue-800 font-bold italic leading-relaxed">"{report.metaAds.targeting.lookalikeStrategy}"</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 bg-slate-900 rounded-3xl text-white flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                          <Clock className="w-6 h-6 text-blue-400" />
                          <div className="text-lg font-bold">Peak Engagement Window</div>
                        </div>
                        <div className="text-3xl font-black text-blue-400 tracking-tight">{report.metaAds.bestTime.peakTime}</div>
                        <div className="flex gap-2">
                          {report.metaAds.bestTime.days.slice(0, 3).map((d, i) => (
                            <span key={i} className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-bold uppercase">{d}</span>
                          ))}
                        </div>
                      </div>
                    </section>

                    {/* Pricing Tiers */}
                    <section className="bg-white p-8 md:p-12 rounded-[3rem] shadow-sm border border-slate-100">
                      <div className="flex items-center gap-6 mb-12">
                        <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                          <DollarSign className="w-8 h-8 text-emerald-600" />
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Price Prediction</h2>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                          { label: 'MVP', price: report.pricing.mvp, roi: report.pricing.mvpROI, note: report.pricing.mvpValueNote, color: 'slate' },
                          { label: 'SWEET SPOT', price: report.pricing.competitive, roi: report.pricing.competitiveROI, note: report.pricing.competitiveValueNote, color: 'blue', featured: true },
                          { label: 'PREMIUM', price: report.pricing.premium, roi: report.pricing.premiumROI, note: report.pricing.premiumValueNote, color: 'amber' }
                        ].map((tier, i) => (
                          <div key={i} className={`p-8 rounded-[2.5rem] border-2 transition-all flex flex-col ${tier.featured ? 'bg-blue-600 border-blue-500 text-white shadow-2xl scale-105' : 'bg-slate-50 border-slate-100 text-slate-900'}`}>
                            <span className={`text-[10px] font-black uppercase tracking-widest mb-6 block ${tier.featured ? 'text-blue-200' : 'text-slate-400'}`}>{tier.label}</span>
                            <div className="text-4xl font-black mb-2">{tier.price}</div>
                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase w-fit mb-8 ${tier.featured ? 'bg-white/20 border border-white/20' : 'bg-emerald-100 text-emerald-600'}`}>ROI: {tier.roi}%</div>
                            <p className={`text-sm font-bold italic leading-relaxed mt-auto ${tier.featured ? 'text-white/90' : 'text-slate-500'}`}>"{tier.note}"</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>

                  {/* Verdict & Scaling */}
                  <div className="space-y-8">
                    <section className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl space-y-10 relative overflow-hidden">
                      <Rocket className="absolute -top-10 -right-10 w-48 h-48 opacity-5 -rotate-12" />
                      <div className="flex items-center gap-4 relative z-10">
                        <Award className="w-7 h-7 text-blue-400" />
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Market Verdict</h3>
                      </div>
                      <div className="text-6xl font-black tracking-tighter leading-none">{report.verdict.decision}</div>
                      <div className="bg-white p-8 rounded-3xl text-slate-950 space-y-4">
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Next Action Step</span>
                        <p className="text-xl font-bold leading-tight italic">"{report.verdict.todayAction}"</p>
                      </div>
                      <div className="space-y-4">
                        {report.verdict.successFactors.map((f, i) => (
                          <div key={i} className="flex items-start gap-3 text-sm font-bold text-slate-300">
                            <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" /> {f}
                          </div>
                        ))}
                      </div>
                    </section>

                    <section className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
                      <div className="flex items-center gap-4">
                        <TrendingUp className="w-6 h-6 text-emerald-500" />
                        <h3 className="text-xl font-extrabold">Scaling Loop</h3>
                      </div>
                      <div className="space-y-4">
                        {report.scalingStrategy.lineExpansionIdeas.map((idea, i) => (
                          <div key={i} className="p-4 bg-slate-50 rounded-2xl text-sm font-bold text-slate-700 flex items-center gap-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full" /> {idea}
                          </div>
                        ))}
                      </div>
                      <p className="text-sm font-bold text-slate-400 italic mt-6 leading-relaxed">"{report.scalingStrategy.actionableAdvice}"</p>
                    </section>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Existing tabs with minor styling updates for roundedness and simplicity */}
        {tab === 'creative' && (
          <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-600 p-3 rounded-xl shadow-lg shadow-blue-100"><Sparkles className="text-white w-6 h-6" /></div>
                    <h2 className="text-xl font-bold">Visual Assets</h2>
                  </div>
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button onClick={() => setCreativeMode('standard')} className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${creativeMode === 'standard' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>Standard</button>
                    <button onClick={() => setCreativeMode('productAd')} className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${creativeMode === 'productAd' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>Product Ad</button>
                  </div>
                  {creativeMode === 'productAd' && (
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Product Image</label>
                      <div className="h-40 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer overflow-hidden shadow-inner" onClick={() => creativeInputRef.current?.click()}>
                        <input type="file" ref={creativeInputRef} className="hidden" accept="image/*" onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader(); reader.onload = () => setProductPhoto(reader.result as string); reader.readAsDataURL(file);
                          }
                        }} />
                        {productPhoto ? <img src={productPhoto} className="w-full h-full object-cover" /> : <Upload className="w-8 h-8 text-slate-300" />}
                      </div>
                    </div>
                  )}
                  <textarea className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 text-sm font-bold h-32 outline-none focus:border-blue-500 transition-all shadow-inner" placeholder="Ad direction (e.g. Luxurious kitchen scene)..." value={genPrompt} onChange={e => setGenPrompt(e.target.value)} />
                  <button onClick={handleCreativeGen} disabled={isGenerating || !genPrompt} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-[0.98] flex items-center justify-center gap-3">
                    {isGenerating ? <Loader2 className="animate-spin w-5 h-5" /> : 'Generate Ad Visual'}
                  </button>
                </div>
              </div>
              <div className="lg:col-span-8">
                {genResult ? (
                  <div className="bg-white p-4 rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden group">
                    <img src={genResult} className="w-full h-auto rounded-2xl" />
                    <button onClick={() => { const a = document.createElement('a'); a.href = genResult!; a.download = 'ad.png'; a.click(); }} className="mt-4 w-full py-4 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2"><Download className="w-5 h-5" /> Download Asset</button>
                  </div>
                ) : (
                  <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] h-[500px] flex flex-col items-center justify-center text-center p-12 text-slate-300">
                    <ImageIcon className="w-16 h-16 mb-4 opacity-20" />
                    <p className="font-bold">Enter creative direction to generate visuals</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === 'insights' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-8">
              <div className="flex items-center gap-4">
                <div className="bg-slate-900 p-3 rounded-xl shadow-lg"><FileSearch className="text-white w-6 h-6" /></div>
                <h2 className="text-xl font-bold">Visual Intelligence Scan</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="h-56 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer overflow-hidden shadow-inner" onClick={() => analysisInputRef.current?.click()}>
                  <input type="file" ref={analysisInputRef} className="hidden" onChange={e => {
                    const file = e.target.files?.[0];
                    if(file) {
                      setAnalysisMime(file.type);
                      const r = new FileReader(); r.onload = () => setAnalysisFile(r.result as string); r.readAsDataURL(file);
                    }
                  }} />
                  {analysisFile ? <img src={analysisFile} className="w-full h-full object-cover" /> : <Upload className="w-10 h-10 text-slate-300" />}
                </div>
                <textarea className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 text-sm font-bold h-56 outline-none focus:border-slate-400 shadow-inner" placeholder="Question about this image/video..." value={analysisPrompt} onChange={e => setAnalysisPrompt(e.target.value)} />
              </div>
              <button onClick={handleAnalysis} disabled={isAnalyzing || !analysisFile} className="w-full bg-slate-900 text-white font-bold py-5 rounded-2xl shadow-xl hover:bg-black transition-all active:scale-[0.98]">
                {isAnalyzing ? <Loader2 className="animate-spin w-5 h-5 mx-auto" /> : 'Run Intelligence Scan'}
              </button>
            </div>
            {analysisResult && (
              <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 animate-in slide-in-from-bottom-4">
                <p className="text-lg font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">{analysisResult}</p>
              </div>
            )}
          </div>
        )}

        {tab === 'audio' && (
          <div className="max-w-xl mx-auto bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-50 p-3 rounded-xl"><Volume2 className="w-6 h-6 text-emerald-600" /></div>
              <h2 className="text-xl font-bold text-slate-900">Voice Synthesis</h2>
            </div>
            <textarea className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-6 text-base font-bold h-40 outline-none focus:border-emerald-400 shadow-inner" placeholder="Text to convert to professional voiceover..." value={ttsInput} onChange={e => setTtsInput(e.target.value)} />
            <button onClick={() => generateTTS(ttsInput)} disabled={isTtsPlaying || !ttsInput} className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-[0.98]">
              Generate Voiceover
            </button>
          </div>
        )}
      </main>

      {/* Modern Fixed Chatbot */}
      {isChatOpen && (
        <div className="fixed bottom-0 right-0 md:bottom-8 md:right-8 w-full md:w-[400px] h-[80vh] md:h-[600px] bg-white border border-slate-200 md:rounded-[2rem] shadow-2xl z-[100] flex flex-col overflow-hidden animate-in slide-in-from-bottom-10">
          <div className="p-6 bg-slate-950 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Bot className="w-6 h-6 text-blue-400" />
              <span className="font-bold">Ads Strategist</span>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="hover:bg-white/10 p-2 rounded-full transition-all"><X className="w-5 h-5" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50 custom-scrollbar">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-bold ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border text-slate-700'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isChatLoading && <Loader2 className="animate-spin w-5 h-5 text-blue-600 mx-auto" />}
            <div ref={chatEndRef} />
          </div>
          <div className="p-6 border-t bg-white flex gap-3">
            <input className="flex-1 bg-slate-100 rounded-xl px-5 py-3 text-sm font-bold outline-none" placeholder="Ask a question..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleChat()} />
            <button onClick={handleChat} disabled={isChatLoading || !chatInput.trim()} className="bg-blue-600 text-white p-3 rounded-xl shadow-lg hover:bg-blue-700 transition-all"><Send className="w-5 h-5" /></button>
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-md z-[200] flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
          <div className="relative mb-12 scale-125">
            <div className="bg-blue-600 p-10 rounded-3xl animate-bounce shadow-2xl">
              <Rocket className="text-white w-16 h-16" />
            </div>
          </div>
          <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Synthesizing Intel</h3>
          <p className="text-blue-600 font-bold uppercase text-[10px] tracking-widest mt-4 animate-pulse">Computing Market Dynamics</p>
        </div>
      )}
      
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 20px; }
      `}</style>
    </div>
  );
}