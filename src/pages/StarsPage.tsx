import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Trophy, Star, ArrowRight, Medal, Crown, Award, Loader2 } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot, doc } from 'firebase/firestore';
import { ChildProfile } from '../types';

import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';
import { BADGE_DEFINITIONS } from '../lib/badgeUtils';

export default function StarsPage() {
  const navigate = useNavigate();
  const [topHeroes, setTopHeroes] = useState<ChildProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [myProfile, setMyProfile] = useState<ChildProfile | null>(null);
  const [myBadges, setMyBadges] = useState<string[]>([]);
  const [myRank, setMyRank] = useState<number | null>(null);

  useEffect(() => {
    const activeChildStr = localStorage.getItem('active_child');
    let myUid: string | null = null;
    if (activeChildStr) {
      const me = JSON.parse(activeChildStr) as ChildProfile;
      setMyProfile(me);
      setMyBadges(me.badges || []);
      myUid = me.uid;
    }

    const q = query(collection(db, 'children_profiles'), orderBy('points', 'desc'), limit(10));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const heroes = snapshot.docs.map((d) => d.data() as ChildProfile);
        setTopHeroes(heroes);
        setLoading(false);
        if (myUid) {
          const rank = heroes.findIndex((h) => h.uid === myUid);
          setMyRank(rank >= 0 ? rank + 1 : null);
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'children_profiles')
    );

    let unsubProfile = () => {};
    if (myUid) {
      unsubProfile = onSnapshot(
        doc(db, 'children_profiles', myUid),
        (snap) => {
          if (snap.exists()) {
            const data = snap.data() as ChildProfile;
            setMyProfile(data);
            setMyBadges(data.badges || []);
          }
        },
        () => {}
      );
    }

    return () => {
      unsubscribe();
      unsubProfile();
    };
  }, []);

  const rankAccent = (i: number) => {
    if (i === 0) return { bg: 'bg-amber-50', ring: 'ring-amber-300', icon: '🥇' };
    if (i === 1) return { bg: 'bg-stone-50', ring: 'ring-stone-300', icon: '🥈' };
    if (i === 2) return { bg: 'bg-orange-50', ring: 'ring-orange-300', icon: '🥉' };
    return { bg: 'bg-white', ring: 'ring-stone-200', icon: `${i + 1}` };
  };

  return (
    <div
      className="min-h-screen bg-[#fdfaf6] font-arabic"
      dir="rtl"
      style={{
        backgroundImage:
          'radial-gradient(circle at 0% 0%, rgba(254,240,138,0.4), transparent 50%), radial-gradient(circle at 100% 0%, rgba(251,207,232,0.3), transparent 45%)',
      }}
    >
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-stone-200/60">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 h-16 flex items-center gap-3">
          <button
            onClick={() => navigate('/child')}
            className="h-10 w-10 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors shrink-0"
            aria-label="العودة"
          >
            <ArrowRight className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2 shrink-0">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-md shadow-amber-200">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-[11px] leading-none text-stone-400 font-bold">قاعة المجد</p>
              <p className="text-sm font-extrabold leading-tight text-stone-800">قاعة النجوم العالمية</p>
            </div>
          </div>

          <div className="flex-1" />

          {myProfile && (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 bg-purple-50 ring-1 ring-purple-200 px-3 py-1.5 rounded-full">
                <Medal className="h-3.5 w-3.5 text-purple-600" />
                <span className="font-extrabold text-purple-700 text-xs">
                  {myBadges.length}/{BADGE_DEFINITIONS.length}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-amber-50 ring-1 ring-amber-200 px-3 py-1.5 rounded-full">
                <Star className="h-4 w-4 text-amber-500 fill-current" />
                <span className="font-extrabold text-amber-700 text-sm">{myProfile.points || 0}</span>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
        {/* Hero banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 p-6 sm:p-8 mb-8 shadow-lg shadow-amber-200"
        >
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-12 -right-8 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10 text-center text-white">
            <Crown className="h-10 w-10 mx-auto mb-3 text-amber-100" />
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-2">أفضل 10 بطلات في العالم</h2>
            <p className="text-amber-50 text-sm sm:text-base font-bold">
              البطلات اللواتي جمعن أكبر عدد من النقاط السحرية
            </p>
          </div>
        </motion.div>

        {/* Leaderboard */}
        <section className="bg-white rounded-3xl ring-1 ring-stone-200 overflow-hidden shadow-sm mb-8">
          <div className="p-5 border-b border-stone-100 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            <h3 className="text-lg font-extrabold text-stone-800">المتصدرات</h3>
          </div>

          <div className="p-5 space-y-3">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-10 w-10 text-amber-500 animate-spin" />
              </div>
            ) : topHeroes.length === 0 ? (
              <div className="text-center py-12 text-stone-400 font-bold">
                لا يوجد بطلات في القائمة بعد. كوني الأولى!
              </div>
            ) : (
              topHeroes.map((hero, index) => {
                const isMe = myProfile && hero.uid === myProfile.uid;
                const accent = rankAccent(index);
                return (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={hero.uid}
                    className={`flex items-center gap-4 p-4 rounded-2xl ring-1 transition-all ${
                      isMe
                        ? 'bg-gradient-to-r from-amber-50 to-rose-50 ring-amber-300 shadow-md'
                        : `${accent.bg} ${accent.ring} hover:shadow-md`
                    }`}
                  >
                    <div className="w-10 h-10 flex items-center justify-center font-extrabold text-xl text-stone-700">
                      {accent.icon}
                    </div>
                    <div
                      className={`w-12 h-12 ${
                        hero.avatar?.color || 'bg-stone-100'
                      } rounded-full flex items-center justify-center text-2xl ring-2 ring-white shadow-sm`}
                    >
                      {hero.avatar?.hairStyle || '👧'}
                    </div>
                    <div className="flex-1 text-right min-w-0">
                      <h3 className="font-extrabold text-stone-800 text-base flex items-center gap-2 truncate">
                        {hero.heroName || hero.name}
                        {isMe && (
                          <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full font-extrabold shrink-0">
                            أنتِ ✨
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-stone-500 font-bold">المستوى {hero.level}</p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-amber-50 ring-1 ring-amber-200 px-3 py-1.5 rounded-full shrink-0">
                      <Star className="h-4 w-4 text-amber-500 fill-current" />
                      <span className="font-extrabold text-amber-700 text-sm">{hero.points}</span>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </section>

        {/* My standing if outside top 10 */}
        {myProfile && myRank === null && !loading && (
          <div className="bg-gradient-to-r from-amber-50 to-rose-50 rounded-3xl ring-1 ring-amber-200 p-5 mb-8 shadow-sm">
            <p className="text-center text-xs text-amber-700 font-extrabold mb-3">
              مكانتكِ الحالية (خارج أفضل 10)
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center text-2xl ring-2 ring-white shadow-sm">
                {myProfile.avatar?.hairStyle || '👧'}
              </div>
              <div className="flex-1 text-right min-w-0">
                <h3 className="font-extrabold text-stone-800 text-base flex items-center gap-2 truncate">
                  {myProfile.heroName || myProfile.name}
                  <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full font-extrabold shrink-0">
                    أنتِ ✨
                  </span>
                </h3>
                <p className="text-xs text-stone-500 font-bold">المستوى {myProfile.level}</p>
              </div>
              <div className="flex items-center gap-1.5 bg-white ring-1 ring-amber-200 px-3 py-1.5 rounded-full shrink-0">
                <Star className="h-4 w-4 text-amber-500 fill-current" />
                <span className="font-extrabold text-amber-700 text-sm">{myProfile.points}</span>
              </div>
            </div>
            <p className="text-center text-xs text-stone-500 mt-3 font-bold">
              اجمعي المزيد من النقاط لتصلي للقائمة! 💪
            </p>
          </div>
        )}

        {/* Achievement badges */}
        {myProfile && (
          <section>
            <div className="flex items-end justify-between mb-5">
              <div>
                <h3 className="text-xl font-extrabold text-stone-800 flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-500" />
                  أوسمتي وإنجازاتي
                </h3>
                <p className="text-stone-500 text-sm font-bold">
                  اجمعي جميع الأوسمة لتصبحي بطلة كاملة
                </p>
              </div>
              <span className="bg-purple-500 text-white text-xs font-extrabold px-3 py-1.5 rounded-full">
                {myBadges.length} / {BADGE_DEFINITIONS.length}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {BADGE_DEFINITIONS.map((badge, i) => {
                const earned = myBadges.includes(badge.id);
                return (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className={`relative bg-white rounded-2xl ring-1 transition-all overflow-hidden ${
                      earned
                        ? 'ring-amber-300 shadow-md hover:shadow-lg'
                        : 'ring-stone-200 opacity-60'
                    }`}
                  >
                    <div className={`h-1.5 w-full ${earned ? 'bg-amber-500' : 'bg-stone-200'}`} />
                    <div className="p-5 text-center">
                      {earned && (
                        <span className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">
                          ✓
                        </span>
                      )}
                      <div className={`text-5xl mb-3 ${!earned ? 'grayscale opacity-40' : ''}`}>
                        {earned ? badge.icon : '🔒'}
                      </div>
                      <h4 className="font-extrabold text-stone-800 text-sm mb-1">{badge.title}</h4>
                      <p className="text-[11px] text-stone-500 leading-relaxed">{badge.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
