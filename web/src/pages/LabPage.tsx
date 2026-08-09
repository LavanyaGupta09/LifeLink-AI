import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, Clock, CheckCircle, Calendar } from 'lucide-react';
import { MOCK_LABS } from '../data/mockData';

const LabPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTest, setSelectedTest] = useState<{ labId: string; testId: string } | null>(null);
  const [booked, setBooked] = useState<string[]>([]);
  const [showBooking, setShowBooking] = useState(false);

  const handleBook = (labId: string, testId: string) => {
    setBooked(prev => [...prev, testId]);
    setSelectedTest(null);
    setShowBooking(false);
  };

  return (
    <div className="app-shell">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}><ArrowLeft size={18} /></button>
        <div>
          <h2 className="page-title">Diagnostic Labs</h2>
          <p className="text-xs text-secondary">{MOCK_LABS.length} labs nearby</p>
        </div>
      </div>

      <div className="page-content">
        {/* Booked banner */}
        {booked.length > 0 && (
          <div className="card card-primary booked-banner animate-fade-in mb-4">
            <div className="flex items-center gap-3">
              <CheckCircle size={20} color="#00C9A7" />
              <div>
                <p className="font-semibold text-sm">{booked.length} Test{booked.length > 1 ? 's' : ''} Booked</p>
                <p className="text-xs text-secondary">Confirmation sent to your phone</p>
              </div>
            </div>
          </div>
        )}

        {MOCK_LABS.map((lab, i) => (
          <div
            key={lab.id}
            className="card lab-card animate-fade-in"
            style={{ animationDelay: `${i * 100}ms`, marginBottom: 16 }}
          >
            {/* Lab header */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-display">{lab.name}</h4>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <MapPin size={11} color="var(--text-tertiary)" />
                    <span className="text-xs text-secondary">{lab.distanceKm} km</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={11} color="var(--text-tertiary)" />
                    <span className="text-xs text-secondary">{lab.openTime}–{lab.closeTime}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={11} color="#FFA502" fill="#FFA502" />
                    <span className="text-xs font-semibold">{lab.rating}</span>
                  </div>
                </div>
              </div>
              <div className="lab-home-badge">🏥</div>
            </div>

            {/* Tests */}
            <p className="text-xs text-tertiary uppercase mb-2">Available Tests</p>
            <div className="tests-list">
              {lab.tests.map(test => {
                const isBooked = booked.includes(test.id);
                return (
                  <div key={test.id} className={`test-row ${!test.available ? 'unavailable' : ''}`}>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{test.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-secondary">⏱ {test.turnaround}</span>
                        {!test.available && <span className="badge badge-warning" style={{ fontSize: '0.5625rem' }}>Not Available</span>}
                      </div>
                    </div>
                    <div className="test-action">
                      <span className="font-bold text-brand" style={{ fontFamily: 'var(--font-display)' }}>₹{test.price}</span>
                      {test.available && !isBooked && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => {
                            setSelectedTest({ labId: lab.id, testId: test.id });
                            setShowBooking(true);
                          }}
                          id={`book-test-${test.id}`}
                        >
                          Book
                        </button>
                      )}
                      {isBooked && (
                        <div className="flex items-center gap-1">
                          <CheckCircle size={14} color="#2ED573" />
                          <span className="text-xs text-success font-semibold">Booked</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Booking modal */}
        {showBooking && selectedTest && (
          <div className="modal-overlay" onClick={() => setShowBooking(false)}>
            <div className="modal-sheet" onClick={e => e.stopPropagation()}>
              <div className="modal-handle" />
              <h3 className="font-display mb-1">Confirm Booking</h3>
              <p className="text-sm text-secondary mb-4">Select a slot and confirm your test booking</p>

              <p className="text-xs text-tertiary uppercase mb-2">Select Time Slot</p>
              <div className="slot-grid mb-4">
                {['7:00 AM', '8:30 AM', '10:00 AM', '11:30 AM', '2:00 PM', '4:00 PM'].map(slot => (
                  <button key={slot} className="slot-btn">{slot}</button>
                ))}
              </div>

              <div className="card mb-4" style={{ cursor: 'default' }}>
                <div className="flex items-center gap-2">
                  <Calendar size={14} color="var(--primary)" />
                  <span className="text-sm font-semibold">Tomorrow · Home Collection Available</span>
                </div>
              </div>

              <button className="btn btn-primary btn-block btn-lg" onClick={() => handleBook(selectedTest.labId, selectedTest.testId)} id="confirm-booking-btn">
                Confirm Booking
              </button>
              <button className="btn btn-ghost btn-block mt-2" onClick={() => setShowBooking(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .booked-banner { cursor: default; }
        .lab-card { cursor: default; }
        .lab-home-badge {
          width: 44px;
          height: 44px;
          background: var(--bg-elevated);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          flex-shrink: 0;
        }
        .tests-list { display: flex; flex-direction: column; gap: 0; }
        .test-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 10px 0;
          border-bottom: 1px solid var(--border);
        }
        .test-row:last-child { border-bottom: none; }
        .test-row.unavailable { opacity: 0.45; }
        .test-action {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 6px;
          flex-shrink: 0;
        }
        .slot-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }
        .slot-btn {
          padding: 10px 0;
          border-radius: var(--radius-md);
          background: var(--bg-elevated);
          border: 1.5px solid var(--border);
          color: var(--text-primary);
          font-size: 0.8125rem;
          font-weight: 600;
          cursor: pointer;
          font-family: var(--font-body);
          transition: all var(--duration-fast);
        }
        .slot-btn:hover { border-color: var(--primary); color: var(--primary); background: var(--primary-glow); }
      `}</style>
    </div>
  );
};

export default LabPage;
