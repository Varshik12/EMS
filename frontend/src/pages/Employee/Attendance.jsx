import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Clock, CheckCircle2, Play, Power, AlertTriangle, HelpCircle, Activity } from 'lucide-react';

export const Attendance = () => {
  const { attendance, checkInStatus, handleCheckIn, handleCheckOut } = useApp();
  const [elapsedTime, setElapsedTime] = useState('00:00:00');

  // Interactive Live Clock
  const [liveTime, setLiveTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Update elapsed session time if checked in
  useEffect(() => {
    let timer;
    if (checkInStatus.checkedIn && checkInStatus.lastCheckInTime) {
      const updateElapsed = () => {
        try {
          const [timeVal, period] = checkInStatus.lastCheckInTime.split(' ');
          let [inHr, inMin] = timeVal.split(':').map(Number);
          if (period === 'PM' && inHr !== 12) inHr += 12;
          if (period === 'AM' && inHr === 12) inHr = 0;

          const checkInDate = new Date();
          checkInDate.setHours(inHr, inMin, 0, 0);

          const now = new Date();
          let diffMs = now.getTime() - checkInDate.getTime();
          
          if (diffMs < 0) {
            diffMs = 0;
          }

          const hours = Math.floor(diffMs / (1000 * 60 * 60));
          const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

          const pad = (num) => num.toString().padStart(2, '0');
          setElapsedTime(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
        } catch (e) {
          setElapsedTime('00:00:00');
        }
      };

      updateElapsed();
      timer = setInterval(updateElapsed, 1000);
    } else {
      setElapsedTime('00:00:00');
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [checkInStatus.checkedIn, checkInStatus.lastCheckInTime]);

  const activeDay = liveTime.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const activeTimeStr = liveTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight sm:text-2xl">Attendance Registry</h1>
        <p className="text-xs text-slate-400 font-medium">Log shift check-ins, record working breaks, and monitor historical punctuality charts.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Clock Terminal */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col items-center justify-between text-center min-h-[350px]">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">
              Shift Terminal 01
            </span>
            <p className="text-xs text-slate-500 mt-4 font-semibold">{activeDay}</p>
            <h2 className="text-3xl font-mono font-bold text-slate-800 tracking-tight mt-1.5">{activeTimeStr}</h2>
          </div>

          {/* Interactive Core */}
          <div className="my-6">
            {checkInStatus.checkedIn ? (
              <div className="space-y-2">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 animate-pulse">
                  <Activity className="h-10 w-10" />
                </div>
                <div className="pt-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Shift Elapsed Time</p>
                  <p className="text-2xl font-mono font-bold text-slate-800 mt-0.5">{elapsedTime}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 text-slate-400 border border-slate-200">
                  <Clock className="h-10 w-10" />
                </div>
                <p className="text-xs text-slate-400 font-medium pt-2">No active workspace session</p>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="w-full pt-4 border-t border-slate-100">
            {checkInStatus.checkedIn ? (
              <button
                onClick={handleCheckOut}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 py-3.5 text-sm font-bold text-white shadow-md shadow-rose-600/15 hover:bg-rose-700 transition"
              >
                <Power className="h-4.5 w-4.5" />
                Clock Out (End Shift)
              </button>
            ) : (
              <button
                onClick={handleCheckIn}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-md shadow-indigo-600/15 hover:bg-indigo-700 transition"
              >
                <Play className="h-4.5 w-4.5" />
                Clock In (Start Shift)
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Attendance Records Table */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <CheckCircle2 className="h-4.5 w-4.5 text-indigo-600" />
              Chronological History Log
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Filtered: This Month
            </span>
          </div>

          {/* History Log Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-1">Date</th>
                  <th className="py-3 px-1">Clock In</th>
                  <th className="py-3 px-1">Clock Out</th>
                  <th className="py-3 px-1">Total Hours</th>
                  <th className="py-3 px-1">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {attendance && attendance.length > 0 ? (
                  attendance.map((rec) => {
                    const statusColors = {
                      'On Time': 'bg-emerald-50 text-emerald-700 border-emerald-100',
                      'Late': 'bg-amber-50 text-amber-700 border-amber-100',
                      'Half Day': 'bg-indigo-50 text-indigo-700 border-indigo-100',
                      'Absent': 'bg-rose-50 text-rose-700 border-rose-100'
                    }[rec.status] || 'bg-slate-50 text-slate-700 border-slate-100';

                    return (
                      <tr key={rec.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3.5 px-1 font-semibold text-slate-800">{rec.date}</td>
                        <td className="py-3.5 px-1 font-medium text-slate-600">{rec.checkIn}</td>
                        <td className="py-3.5 px-1 font-medium text-slate-600">
                          {rec.checkOut ? rec.checkOut : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                              <span className="h-1 w-1 bg-emerald-500 rounded-full animate-ping"></span>
                              ACTIVE
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-1 font-mono text-slate-500 font-bold">
                          {rec.hoursWorked ? rec.hoursWorked : '--'}
                        </td>
                        <td className="py-3.5 px-1">
                          <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wide ${statusColors}`}>
                            {rec.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 font-semibold">
                      No attendance logs recorded yet. Click "Clock In" to log your first shift.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="rounded-xl bg-indigo-50/50 border border-indigo-100/50 p-4 text-[11px] text-slate-600 flex items-start gap-2.5 mt-2">
            <AlertTriangle className="h-4.5 w-4.5 shrink-0 text-indigo-600" />
            <div>
              <p className="font-bold text-indigo-950">Industrial Punctuality Compliance Policy</p>
              <p className="mt-0.5 leading-relaxed">
                Check-ins recorded after <strong>09:00 AM</strong> are automatically categorized as <strong className="text-amber-700 font-semibold">Late</strong>. Continuous delayed listings trigger operational team review. Please clock out responsibly after each completed shift to maintain integrity in hourly tallies.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
