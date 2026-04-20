import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Palette, Eraser, Trash2, Download, ArrowLeft, Sparkles, Star, Heart, Shield, Wand2, Undo, Redo } from 'lucide-react';
import { toast } from 'sonner';

const COLORS = [
  '#ff4d6d', '#ff758f', '#ff8fa3', '#ffb3c1', // Pinks
  '#7209b7', '#b5179e', '#f72585', '#480ca8', // Purples
  '#4361ee', '#4cc9f0', '#4895ef', '#3f37c9', // Blues
  '#2d6a4f', '#40916c', '#52b788', '#74c69d', // Greens
  '#ff9f1c', '#ffbf69', '#ffffff', '#000000', // Others
];

const BRUSH_SIZES = [5, 10, 20, 40];

const TEMPLATES = [
  { id: 'heart', icon: '❤️', path: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' },
  { id: 'star', icon: '⭐', path: 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2L9.19 8.63L2 9.24l5.46 4.73L5.82 21z' },
  { id: 'shield', icon: '🛡️', path: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z' },
  { id: 'butterfly', icon: '🦋', path: 'M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM4 4c0 1.1.9 2 2 2s2-.9 2-2-.9-2-2-2-2 .9-2 2zm0 16c0 1.1.9 2 2 2s2-.9 2-2-.9-2-2-2-2 .9-2 2zm16-16c0 1.1.9 2 2 2s2-.9 2-2-.9-2-2-2-2 .9-2 2zm0 16c0 1.1.9 2 2 2s2-.9 2-2-.9-2-2-2-2 .9-2 2z' },
  { id: 'flower', icon: '🌸', path: 'M12 2c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.48-10-10-10zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z' },
  { id: 'cat', icon: '🐱', path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z' },
];

export default function ColoringStudio() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState(COLORS[0]);
  const [brushSize, setBrushSize] = useState(10);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size based on container
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        
        // Fill with white
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        saveToHistory();
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(dataUrl);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveToHistory();
    }
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) ctx.beginPath();
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvasElement = canvasRef.current;
    const ctx = canvasElement?.getContext('2d');
    if (!canvasElement || !ctx) return;

    if (typeof canvasElement.getBoundingClientRect !== 'function') return;
    const rect = canvasElement.getBoundingClientRect();
    const x = ('touches' in e) ? (e as any).touches[0].clientX - rect.left : (e as any).clientX - rect.left;
    const y = ('touches' in e) ? (e as any).touches[0].clientY - rect.top : (e as any).clientY - rect.top;

    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = tool === 'eraser' ? 'white' : color;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      loadFromHistory(newIndex);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      loadFromHistory(newIndex);
    }
  };

  const loadFromHistory = (index: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const img = new Image();
    img.src = history[index];
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  };

  const clearCanvas = () => {
    if (!window.confirm('هل تريدين مسح اللوحة بالكامل؟')) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveToHistory();
    toast.success('تم مسح اللوحة!');
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `hero-drawing-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
    toast.success('تم حفظ اللوحة في جهازك!');
  };

  const drawTemplate = (path: string) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(10, 10);
    ctx.translate(-12, -12); // Center the 24x24 path
    
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 0.5;
    const p = new Path2D(path);
    ctx.stroke(p);
    ctx.restore();
    
    saveToHistory();
    toast.success('تم إضافة القالب السحري!');
  };

  return (
    <div className="min-h-screen bg-[#fff5f7] flex flex-col font-arabic" dir="rtl">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md p-4 border-b-4 border-pink-100 flex items-center justify-between relative z-50">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/child')}
            className="bg-pink-50 p-3 rounded-2xl text-princess-pink hover:bg-pink-100 transition-all"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-princess-pink p-2 rounded-xl shadow-lg">
              <Palette className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-princess-purple">مرسم البطلات السحري</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-3 rounded-xl bg-white border-2 border-pink-50 text-princess-purple disabled:opacity-30 hover:bg-pink-50 transition-all"
          >
            <Undo className="w-5 h-5" />
          </button>
          <button 
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-3 rounded-xl bg-white border-2 border-pink-50 text-princess-purple disabled:opacity-30 hover:bg-pink-50 transition-all"
          >
            <Redo className="w-5 h-5" />
          </button>
          <button 
            onClick={downloadImage}
            className="bg-emerald-500 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:bg-emerald-600 transition-all flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            <span>حفظ اللوحة</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar Tools */}
        <aside className="w-full md:w-80 bg-white border-l-4 border-pink-50 p-6 flex flex-col gap-8 overflow-y-auto">
          {/* Tools Toggle */}
          <div className="flex bg-pink-50 p-1 rounded-2xl">
            <button 
              onClick={() => setTool('brush')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${tool === 'brush' ? 'bg-princess-pink text-white shadow-md' : 'text-princess-pink'}`}
            >
              <Wand2 className="w-5 h-5" />
              فرشاة
            </button>
            <button 
              onClick={() => setTool('eraser')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${tool === 'eraser' ? 'bg-princess-pink text-white shadow-md' : 'text-princess-pink'}`}
            >
              <Eraser className="w-5 h-5" />
              ممحاة
            </button>
          </div>

          {/* Colors Grid */}
          <div>
            <h3 className="text-sm font-bold text-princess-purple mb-4 flex items-center gap-2">
              <Palette className="w-4 h-4" /> الألوان السحرية
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => {
                    setColor(c);
                    setTool('brush');
                  }}
                  className={`w-full aspect-square rounded-xl shadow-sm transition-all transform hover:scale-110 border-4 ${color === c && tool === 'brush' ? 'border-princess-purple ring-2 ring-pink-200' : 'border-white'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Brush Sizes */}
          <div>
            <h3 className="text-sm font-bold text-princess-purple mb-4">حجم الفرشاة</h3>
            <div className="flex items-center justify-between bg-pink-50 p-4 rounded-2xl">
              {BRUSH_SIZES.map(size => (
                <button
                  key={size}
                  onClick={() => setBrushSize(size)}
                  className={`rounded-full bg-princess-purple transition-all ${brushSize === size ? 'scale-125 shadow-lg' : 'opacity-30 hover:opacity-60'}`}
                  style={{ width: size + 4, height: size + 4 }}
                />
              ))}
            </div>
          </div>

          {/* Templates */}
          <div>
            <h3 className="text-sm font-bold text-princess-purple mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> قوالب سحرية للتلوين
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {TEMPLATES.map(t => (
                <button
                  key={t.id}
                  onClick={() => drawTemplate(t.path)}
                  className="bg-pink-50 hover:bg-pink-100 p-4 rounded-2xl text-3xl shadow-sm transition-all transform hover:scale-110 border-2 border-pink-100"
                  title="إضافة قالب"
                >
                  {t.icon}
                </button>
              ))}
            </div>
          </div>

          {/* Clear Canvas */}
          <button 
            onClick={clearCanvas}
            className="mt-auto flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-red-100 text-red-500 font-bold hover:bg-red-50 transition-all"
          >
            <Trash2 className="w-5 h-5" />
            مسح كل شيء
          </button>
        </aside>

        {/* Canvas Area */}
        <main className="flex-1 bg-slate-200 p-4 md:p-8 flex items-center justify-center relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ff4d6d 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          
          <div className="w-full h-full bg-white rounded-[2.5rem] shadow-2xl border-8 border-white relative overflow-hidden cursor-crosshair">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-full touch-none"
            />
            
            {/* Floating Sparkles */}
            <motion.div 
              animate={{ y: [0, -20, 0], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute top-10 right-10 text-4xl pointer-events-none"
            >
              ✨
            </motion.div>
            <motion.div 
              animate={{ y: [0, 20, 0], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 4, repeat: Infinity, delay: 1 }}
              className="absolute bottom-10 left-10 text-4xl pointer-events-none"
            >
              🎨
            </motion.div>
          </div>
        </main>
      </div>

      {/* Footer Tips */}
      <footer className="bg-white p-4 border-t-4 border-pink-50 text-center">
        <p className="text-princess-purple font-bold flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-princess-gold" />
          ارسمي بطلتك المفضلة وشاركيها مع صديقاتك في النادي!
          <Sparkles className="w-4 h-4 text-princess-gold" />
        </p>
      </footer>
    </div>
  );
}
