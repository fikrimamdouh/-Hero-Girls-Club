import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { UniverseZone } from '../../data/kidsUniverse';

export default function ZoneCard({ zone, delay = 0 }: { zone: UniverseZone; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="group rounded-3xl bg-white border-2 border-white/80 shadow-lg hover:shadow-2xl overflow-hidden"
    >
      <div className={`bg-gradient-to-r ${zone.gradient} p-5 text-white relative`}>
        <span className="absolute top-3 left-3 text-xs bg-white/25 px-2 py-1 rounded-full font-bold">{zone.tag}</span>
        <div className="text-4xl mb-2">{zone.emoji}</div>
        <h3 className="text-2xl font-black">{zone.title}</h3>
        <p className="text-white/90 font-medium">{zone.subtitle}</p>
      </div>
      <div className="p-4">
        <Link
          to={zone.path}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-2 font-bold hover:bg-slate-700"
        >
          ادخلي الآن ✨
        </Link>
      </div>
    </motion.div>
  );
}
