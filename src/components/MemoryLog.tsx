import React from 'react';
import { RecalledRecord, TextSize } from '../types/game';
import { WORD_BANK } from '../data/wordBank';
import { soundManager } from '../utils/soundEffects';
import { Calendar, Award, BookMarked, CheckCircle, Trash2, Printer } from 'lucide-react';

interface MemoryLogProps {
  records: RecalledRecord[];
  textSize: TextSize;
  onClearRecords: () => void;
}

export const MemoryLog: React.FC<MemoryLogProps> = ({ records, textSize, onClearRecords }) => {
  const successRecords = records.filter(r => r.success);
  const totalCount = successRecords.length;

  // Group by category
  const categoryCounts: Record<string, number> = {};
  successRecords.forEach(r => {
    categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 pb-12">
      {/* Top Banner Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-white rounded-xl border border-stone-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center font-serif text-xl font-bold">
            記
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-stone-900">
              어르신 두뇌 기억 일지
            </h2>
            <div className="text-xs text-stone-600">
              오늘 소환한 정다운 단어들과 두뇌 활력 기록을 한눈에 살펴보세요
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg border border-stone-300 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>일지 인쇄하기</span>
          </button>
          {records.length > 0 && (
            <button
              type="button"
              onClick={onClearRecords}
              className="flex items-center gap-1 px-3 py-1.5 text-stone-500 hover:text-rose-600 text-xs rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>기록 비우기</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-xs flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-stone-600 font-medium">오늘 소환한 단어</div>
            <div className="text-2xl font-black text-stone-900 font-mono tabular-nums">
              {totalCount} <span className="text-sm font-normal text-stone-600">개</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-xs flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-stone-600 font-medium">두뇌 활력 점수</div>
            <div className="text-2xl font-black text-emerald-700 font-mono tabular-nums">
              {totalCount * 120} <span className="text-sm font-normal text-stone-600">P</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-xs flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-stone-600 font-medium">기억 건강 등급</div>
            <div className="text-xl font-black text-sky-900">
              {totalCount >= 15 ? '청춘 활력 만점 🌸' : totalCount >= 5 ? '활기찬 두뇌 🌿' : '기분 좋은 출발 🌱'}
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="p-5 bg-white rounded-xl border border-stone-200 shadow-xs">
        <h3 className="text-sm font-bold text-stone-900 mb-3">
          영역별 단어 소환 분포
        </h3>
        {Object.keys(categoryCounts).length === 0 ? (
          <p className="text-xs text-stone-600 py-3 text-center">
            아직 소환된 단어가 없습니다. 소나기 타자나 퀴즈를 즐겨보세요!
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {Object.entries(categoryCounts).map(([cat, cnt]) => (
              <div
                key={cat}
                className="p-3 bg-stone-50 rounded-lg border border-stone-200 flex items-center justify-between"
              >
                <span className="text-xs font-semibold text-stone-800">{cat}</span>
                <span className="text-sm font-black text-amber-800 font-mono">{cnt}개</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Certificate Card for Seniors (Dignified and warm) */}
      <div className="p-6 sm:p-8 bg-amber-50/60 rounded-2xl border-2 border-amber-300 shadow-sm relative overflow-hidden">
        <div className="text-center flex flex-col items-center gap-2">
          <span className="text-xs font-bold text-amber-800 tracking-widest uppercase">
            두뇌 건강 활력 증서
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-stone-900 font-serif">
            청춘 기억 건강 인증
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 max-w-md mt-1 leading-relaxed">
            귀하는 오늘 정다운 우리말 단어를 소환하고 타이핑함으로써 두뇌 건강과 인지 활력을 크게 드높이셨습니다.
          </p>
        </div>

        <div className="mt-6 pt-5 border-t border-amber-200/80 flex items-center justify-between text-xs text-stone-600">
          <span>청춘타자 두뇌교실</span>
          <span>기록일: {new Date().toLocaleDateString('ko-KR')}</span>
        </div>
      </div>

      {/* Recalled Words List */}
      <div className="p-5 bg-white rounded-xl border border-stone-200 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <BookMarked className="w-4 h-4 text-amber-600" />
          <h3 className="text-sm font-bold text-stone-900">
            오늘 소환한 추억의 단어 목록
          </h3>
        </div>

        {successRecords.length === 0 ? (
          <div className="text-center py-8 text-stone-600 text-sm">
            소나기 단어소환이나 단어 연상 퀴즈를 시작해 보세요!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {successRecords.slice(-16).reverse().map(rec => {
              const matched = WORD_BANK.find(w => w.word === rec.word);
              return (
                <div
                  key={rec.id}
                  className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-stone-900">{rec.word}</span>
                    <span className="text-[11px] text-amber-900 font-medium bg-amber-100 px-2 py-0.5 rounded">
                      {rec.category}
                    </span>
                  </div>
                  {matched && (
                    <p className="text-xs text-stone-600 leading-relaxed">
                      {matched.clue}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
