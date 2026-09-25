import re

with open('src/pages/LiveTrackingPage.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update imports
code = code.replace(
    "import { useParams, useNavigate } from 'react-router-dom';",
    "import { useParams, useNavigate, useLocation } from 'react-router-dom';"
)

# 2. Update CONFIG_MAP.ambulance.steps
new_amb_config = """  ambulance: {
    title: 'Ambulance Tracking',
    vehicleIcon: <Ambulance size={28} className="text-rose-500" />,
    providerName: 'Apollo Rescue Unit',
    providerRole: 'Paramedic Team',
    providerRating: '⭐ 4.9 (Critical Care)',
    steps: ['Emergency Requested', 'Ambulance Assigned', 'Ambulance Dispatched', 'Ambulance Reaching Patient', 'Patient Picked Up', 'Hospital Selected', 'Hospital Notified', 'En Route to Hospital', 'Arriving at Hospital', 'Patient Reached Hospital'],
    initialDistance: 3.2,
    initialEta: 9,
  },"""
code = re.sub(r"  ambulance: \{[\s\S]*?initialEta: 9,\n  \},", new_amb_config, code)

# 3. Add states and logic in component
state_additions = """  const locationState = useLocation().state as any;
  const destinationHospital = locationState?.hospital;
  
  const [journeyStage, setJourneyStage] = useState<1 | 2>(1);
  const [isArrivedAtHospital, setIsArrivedAtHospital] = useState(false);"""
code = code.replace("const [activeChat, setActiveChat] = useState(false);", "const [activeChat, setActiveChat] = useState(false);\n" + state_additions)

# 4. Update Simulation Timer
new_timer = """  // Simulation Timer
  useEffect(() => {
    if (type !== 'ambulance' && isArrived) return;
    if (type === 'ambulance' && isArrivedAtHospital) return;

    const interval = setInterval(() => {
      setDistance(prev => {
        const next = Math.max(0, prev - 0.4);
        if (next === 0) {
          if (type === 'ambulance' && journeyStage === 1) {
            setIsArrived(true);
            setJourneyStage(2);
            setEta(15);
            return 5.0; // Distance to hospital
          } else {
            if (type === 'ambulance') {
              setIsArrivedAtHospital(true);
            } else {
              setIsArrived(true);
            }
            setEta(0);
            setCurrentStep(config.steps.length - 1);
          }
        }
        return Number(next.toFixed(1));
      });
      
      setEta(prev => {
        if (prev === 0) return 0;
        return Math.max(0, prev - 1);
      });

    }, 3000); // Update every 3 seconds for demo speed

    return () => clearInterval(interval);
  }, [isArrived, isArrivedAtHospital, journeyStage, config.steps.length, type]);"""
code = re.sub(r"  // Simulation Timer\n  useEffect\(\(\) => \{[\s\S]*?\}, \[isArrived, config\.steps\.length\]\);", new_timer, code)

# 5. Update Stepper Logic
new_stepper = """  // Stepper logic progression mapping
  useEffect(() => {
    if (type !== 'ambulance' && isArrived) return;
    if (type === 'ambulance' && isArrivedAtHospital) return;
    
    let targetStep = 1;
    
    if (type === 'ambulance') {
      if (journeyStage === 1) {
        const progress = 1 - (distance / config.initialDistance);
        if (progress > 0.0) targetStep = 2; // Dispatched
        if (progress > 0.3) targetStep = 3; // Reaching
        if (progress >= 1.0) targetStep = 4; // Picked up
      } else {
        const progress = 1 - (distance / 5.0);
        targetStep = 5; // Hospital Selected
        if (progress > 0.1) targetStep = 6; // Notified
        if (progress > 0.3) targetStep = 7; // En route
        if (progress > 0.8) targetStep = 8; // Arriving
        if (progress >= 1.0) targetStep = 9; // Reached
      }
    } else if (type === 'medicine') {"""
code = code.replace("""  // Stepper logic progression mapping
  useEffect(() => {
    if (isArrived) return;
    
    // Map distance progress to step index roughly
    const progress = 1 - (distance / config.initialDistance);
    
    // For ambulance: 4 steps (0: Broadcast, 1: Dispatched, 2: En Route, 3: Arrived)
    // For medicine: 5 steps (0: Confirmed, 1: Preparing, 2: Packed, 3: Out, 4: Delivered)
    // For lab: 7 steps
    let targetStep = 1;
    
    if (type === 'ambulance') {
      if (progress > 0.1) targetStep = 1; // Dispatched
      if (progress > 0.3) targetStep = 2; // En Route
      if (progress >= 1.0) targetStep = 3; // Arrived
    } else if (type === 'medicine') {""", new_stepper)

code = code.replace("""[distance, config.initialDistance, type, currentStep, isArrived]);""", """[distance, config.initialDistance, type, currentStep, isArrived, isArrivedAtHospital, journeyStage]);""")

# 6. Update UI Maps/Status
code = code.replace(
    "top: isArrived ? '50%' : `${10 + (1 - distance / config.initialDistance) * 40}%`,",
    "top: (type === 'ambulance' ? isArrivedAtHospital : isArrived) ? '50%' : `${10 + (1 - distance / (journeyStage === 2 ? 5.0 : config.initialDistance)) * 40}%`,"
).replace(
    "left: isArrived ? '50%' : `${10 + (1 - distance / config.initialDistance) * 40}%`,",
    "left: (type === 'ambulance' ? isArrivedAtHospital : isArrived) ? '50%' : `${10 + (1 - distance / (journeyStage === 2 ? 5.0 : config.initialDistance)) * 40}%`,"
)

code = code.replace(
    ">YOU</div>",
    ">{type === 'ambulance' && journeyStage === 2 ? 'HOSPITAL' : 'YOU'}</div>"
)

code = code.replace(
    "{isArrived ? 'Arrived' : `${distance} km away`}",
    "{(type === 'ambulance' ? isArrivedAtHospital : isArrived) ? 'Arrived' : `${distance} km away`}"
).replace(
    "{isArrived ? 'Now' : `${eta} min`}",
    "{(type === 'ambulance' ? isArrivedAtHospital : isArrived) ? 'Now' : `${eta} min`}"
)

# 7. Add Hospital Card UI
hospital_card_ui = """          {type === 'ambulance' && destinationHospital && (
            <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-500/10 rounded-full flex items-center justify-center">
                  <Ambulance size={20} className="text-rose-500" />
                </div>
                <div>
                  <p className="text-xs text-textSecondary font-bold">Destination Hospital</p>
                  <p className="text-sm font-bold text-textPrimary">🏥 {destinationHospital.name}</p>
                </div>
              </div>
              {journeyStage === 1 && (
                <button className="text-xs font-bold text-rose-500 border border-rose-500 px-3 py-1.5 rounded-lg" onClick={() => navigate(-1)}>
                  Change
                </button>
              )}
            </div>
          )}
          
          {/* WIDGET 2: PROGRESS PIPELINE */}"""
code = code.replace("{/* WIDGET 2: PROGRESS PIPELINE */}", hospital_card_ui)

with open('src/pages/LiveTrackingPage.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
