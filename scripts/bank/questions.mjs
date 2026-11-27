const questions = []
let seq = 0

function add(id, vehicle, category, skill, bucket, prompt, choices, answer, explanation) {
  if (questions.some((q) => q.id === id)) throw new Error(`Duplicate question ${id}`)
  if (!Array.isArray(choices) || choices.length !== 4) throw new Error(`Need 4 choices for ${id}`)
  if (!Number.isInteger(answer) || answer < 0 || answer > 3) throw new Error(`Bad answer for ${id}`)
  if (!explanation || explanation.length < 40) throw new Error(`Explanation too thin for ${id}`)
  questions.push({
    id,
    vehicle,
    category,
    skill,
    bucket,
    prompt,
    choices,
    answer,
    explanation,
    rev: 1,
  })
}

function core(id, vehicle, category, skill, prompt, choices, answer, explanation) {
  add(id, vehicle, category, skill, 0, prompt, choices, answer, explanation)
}

function rotating(id, vehicle, category, skill, prompt, choices, answer, explanation) {
  seq += 1
  add(id, vehicle, category, skill, (seq % 4) + 1, prompt, choices, answer, explanation)
}

const OL = ['ES S-AWC', 'SE S-AWC', 'LE S-AWC', 'GT S-AWC']
const OL_UPPER = ['SE S-AWC', 'LE S-AWC', 'SEL S-AWC', 'GT S-AWC']
const OL_TOP = ['SEL S-AWC', 'GT S-AWC', 'GT Premium S-AWC', 'Noir S-AWC']

function firstTrim(id, feature, winner, why, choices = OL) {
  const answer = choices.indexOf(winner)
  rotating(
    id,
    'Outlander',
    'trims',
    'product',
    `A shopper asks where the 2026 Outlander first gets ${feature}. Which trim do you walk them to?`,
    choices,
    answer,
    why,
  )
}

firstTrim(
  'ol-sunroof',
  'a power panoramic sunroof',
  'SE S-AWC',
  'The sunroof arrives at SE, along with the wireless charger, FAST-Key, heated steering wheel and hands-free liftgate. ES does not have it. Open the window sticker before you promise glass.',
)
firstTrim(
  'ol-charger',
  'a smartphone wireless charger',
  'SE S-AWC',
  'Wireless charging is an SE feature on the 2026 gas Outlander. If their phone matters, sit them in an SE or above and say so plainly.',
)
firstTrim(
  'ol-wheel',
  'a heated steering wheel',
  'SE S-AWC',
  'Heated steering wheel starts at SE. In a Port Coquitlam winter that is a real reason to step up, and only if the truck you are presenting actually has it.',
)
firstTrim(
  'ol-liftgate',
  'a hands-free power liftgate',
  'SE S-AWC',
  'Hands-free power liftgate with adjustable height is SE. Parents with hands full of car seats feel this on the second visit to the lot. Do not demo it on an ES.',
)
firstTrim(
  'ol-3zone',
  '3-zone automatic climate control',
  'SE S-AWC',
  'ES is dual-zone. The third zone arrives at SE. Say that out loud when a family complains the kids are always too hot.',
)
firstTrim(
  'ol-fastkey',
  'FAST-Key keyless entry',
  'SE S-AWC',
  'FAST-Key is part of the SE equipment group. Know the step so you stop reading a brochure like a tourist.',
)
firstTrim(
  'ol-fog',
  'LED fog lights',
  'SE S-AWC',
  'LED fog lights are an SE addition, with the grey skid-plate styling and power-folding heated mirrors.',
)
firstTrim(
  'ol-acc',
  'adaptive cruise control',
  'LE S-AWC',
  'On the gas Outlander, adaptive cruise starts at LE. Stop-and-go cruise is a further step, at GT. Do not say "it has radar cruise" until you are in an LE or higher.',
)
firstTrim(
  'ol-18',
  '18-inch two-tone alloy wheels',
  'LE S-AWC',
  'LE rides on 18-inch two-tone alloys. SEL and above move to 20-inch wheels. Wheel size is a trim fact, not a vibe.',
)
firstTrim(
  'ol-suede',
  'microsuede and synthetic leather seating',
  'LE S-AWC',
  'LE is the microsuede step. Quilted leather-appointed seating waits for SEL. If they hate cloth, do not park them in an ES.',
)
firstTrim(
  'ol-nav',
  'embedded navigation',
  'LE S-AWC',
  'Embedded navigation is LE. ES and SE use the 12.3-inch smartphone-link display with wireless Apple CarPlay and Android Auto, which is not the same as built-in nav.',
)
firstTrim(
  'ol-360',
  'a multi-view camera system with moving-object detection',
  'LE S-AWC',
  'The 360-degree Multi View Camera System arrives at LE. Tight parkades downtown are the demo. ES does not have it.',
)
firstTrim(
  'ol-connect',
  'Mitsubishi Connect',
  'LE S-AWC',
  'Mitsubishi Connect, with the trial that requires app enrollment, is an LE item. Mention the enrollment step so the app is not a surprise at delivery.',
)
firstTrim(
  'ol-360l',
  'SiriusXM with 360L',
  'LE S-AWC',
  'Every Outlander includes a SiriusXM trial. The 360L service is the LE upgrade. Three months is a trial, not a lifetime subscription. Say that.',
)
firstTrim(
  'ol-20',
  '20-inch two-tone alloys',
  'SEL S-AWC',
  '20-inch two-tone wheels start at SEL. LE is 18-inch. A buyer who wants the big wheel is an SEL conversation, including the ride that comes with it.',
  OL_UPPER,
)
firstTrim(
  'ol-heat2',
  'heated second-row seats',
  'SEL S-AWC',
  'Heated second row is SEL. That is the trim for the parent who rides in back on the way to Golden Ears, not a feature you invent on an SE.',
  OL_UPPER,
)
firstTrim(
  'ol-vent',
  'ventilated front seats',
  'SEL S-AWC',
  'Ventilated fronts arrive with the leather-appointed SEL. It is a summer feature you can still sell in November because August always comes back.',
  OL_UPPER,
)
firstTrim(
  'ol-memory',
  'memory for the driver seat and mirrors',
  'SEL S-AWC',
  'Key-linked memory for the seat and exterior mirrors is SEL. Two-driver households feel it the first week. LE has power, not memory.',
  OL_UPPER,
)
firstTrim(
  'ol-leather',
  'leather-appointed seats',
  'SEL S-AWC',
  'Leather-appointed seating starts at SEL. LE is microsuede. GT Premium steps up again to semi-aniline. Use the right word for the chair they are sitting in.',
  OL_UPPER,
)
firstTrim(
  'ol-cluster',
  'a 12.3-inch full digital driver display',
  'SEL S-AWC',
  'On the gas Outlander the 12.3-inch digital cluster starts at SEL. The 12.3-inch centre screen is already on ES. Those are different screens. Do not blur them.',
  OL_UPPER,
)
firstTrim(
  'ol-rain',
  'rain-sensing wipers',
  'SEL S-AWC',
  'Rain-sensing wipers are SEL on the gas Outlander. Around here that is a daily-use feature, and it is still not on the ES.',
  OL_UPPER,
)
firstTrim(
  'ol-home',
  'HomeLink in the mirror',
  'SEL S-AWC',
  'HomeLink arrives with the SEL auto-dimming mirror. Garage-door households in the Tri-Cities ask. The answer is SEL, not "I think so".',
  OL_UPPER,
)
firstTrim(
  'ol-hud',
  'a 10.8-inch head-up display',
  'GT S-AWC',
  'The 10.8-inch HUD is GT. So are the 12-speaker Yamaha Ultimate system, front parking sensors and the higher driver aids. If they want the HUD, you are in a GT.',
)
firstTrim(
  'ol-yamaha12',
  'the 12-speaker Yamaha Ultimate audio',
  'GT S-AWC',
  'ES through SEL use the 8-speaker Yamaha Premium system. The 12-speaker Ultimate system is GT. Both are Yamaha. The speaker count is the trim tell.',
)
firstTrim(
  'ol-stopgo',
  'adaptive cruise with stop and go',
  'GT S-AWC',
  'LE has adaptive cruise. GT adds stop and go, plus lane departure prevention, active blind spot assist and traffic sign recognition. Highway 1 traffic is the GT story.',
)
firstTrim(
  'ol-ldp',
  'lane departure prevention',
  'GT S-AWC',
  'Lane departure prevention is a GT aid on the gas Outlander. It is a driver aid, not a self-driving system. Say the limitation in the same breath as the feature.',
)
firstTrim(
  'ol-absa',
  'active blind spot assist',
  'GT S-AWC',
  'Active blind spot assist is GT equipment. Blind-spot warning on other Mitsubishi models is not the same feature. Name the one this trim actually has.',
)
firstTrim(
  'ol-semi',
  'semi-aniline leather-appointed seats',
  'GT Premium S-AWC',
  'GT Premium is the semi-aniline interior with brown stitch, plus the frameless digital rearview mirror. GT leather-appointed is the step below. Noir is the blacked-out version of that top cabin.',
  OL_TOP,
)
firstTrim(
  'ol-drm',
  'a frameless digital rearview mirror',
  'GT Premium S-AWC',
  'The frameless digital rearview mirror with HomeLink is GT Premium and Noir. It is not on the GT. If the third row and headrests block their view, this is the honest upgrade.',
  OL_TOP,
)
firstTrim(
  'ol-headliner',
  'a black headliner and Noir badge',
  'Noir S-AWC',
  'Noir is the appearance package: black wheels, black Dynamic Shield, black mirrors, black roof rails, dark emblems, black headliner, aluminum pedals, from $49,748 MSRP. It is not a different powertrain.',
  OL_TOP,
)

rotating(
  'ol-es-standard',
  'Outlander',
  'trims',
  'product',
  'What is already standard on a 2026 Outlander ES S-AWC, before any step-up?',
  [
    'S-AWC, seven seats, 12.3-inch smartphone screen, 8-speaker Yamaha, wireless CarPlay and Android Auto',
    'Panoramic sunroof, heated steering wheel and 360 camera',
    'Head-up display, 12-speaker Yamaha and massage seats',
    'Leather, memory seats and a digital gauge cluster',
  ],
  0,
  'ES is not a stripper in the way people assume. S-AWC, 11 airbags, seven-passenger seating, dual-zone climate, the 12.3-inch display, wireless phone projection and 8-speaker Yamaha are standard. The sunroof and 360 camera are not.',
)
rotating(
  'ol-price-es',
  'Outlander',
  'pricing',
  'product',
  'A guest asks the MSRP of a 2026 Outlander ES S-AWC. You quote which figure, before freight, PDI and taxes?',
  ['$36,398', '$39,098', '$42,198', '$46,998'],
  0,
  'ES starts at $36,398. $39,098 is SE, $42,198 is LE, and $46,998 is the Outlander PHEV ES, a different vehicle. Always add that freight, PDI and taxes are extra, then let the desk build the payment.',
)
rotating(
  'ol-price-se',
  'Outlander',
  'pricing',
  'product',
  'Which MSRP matches the 2026 Outlander SE S-AWC?',
  ['$36,398', '$39,098', '$44,898', '$47,398'],
  1,
  'SE is $39,098. SEL is $44,898 and GT is $47,398. Quote the trim they are sitting in, not the one you wish they would buy.',
)
rotating(
  'ol-price-gt',
  'Outlander',
  'pricing',
  'product',
  'The 2026 Outlander GT S-AWC MSRP is:',
  ['$44,898', '$47,398', '$48,398', '$49,748'],
  1,
  'GT is $47,398. GT Premium is $48,398. Noir is $49,748. The $1,000 steps are easy to blur. Read the sticker.',
)
rotating(
  'ol-price-noir',
  'Outlander',
  'pricing',
  'product',
  'Someone wants the blacked-out 2026 Outlander. The Noir S-AWC MSRP is:',
  ['$47,398', '$48,398', '$49,748', '$63,048'],
  2,
  'Gas Noir is $49,748. $63,048 is the Outlander PHEV GT Noir, which is a plug-in with a much bigger number. Mixing those two up is how a deal blows up in F&I.',
)
core(
  'ol-engine',
  'Outlander',
  'specs',
  'product',
  'What powers the 2026 gas Outlander in Canada?',
  [
    '1.5L turbo with a 48-volt mild hybrid, 174 hp and 206 lb-ft, CVT',
    '2.5L naturally aspirated four-cylinder, 181 hp',
    '2.4L plug-in hybrid, 72 km of electric range',
    '2.0L four-cylinder, 148 hp, front-wheel drive',
  ],
  0,
  'The 2025 naturally aspirated 2.5L is gone. The 2026 gas Outlander uses a 1.5L turbo plus a 48-volt belt starter-generator, rated 174 hp at 5,000 rpm and 206 lb-ft from 3,000 to 4,000 rpm, with a CVT. The 2.4L plug-in is the PHEV. The 2.0L is an RVR ES.',
)
core(
  'ol-fuel',
  'Outlander',
  'specs',
  'product',
  'NRCan combined fuel consumption for the 2026 gas Outlander is:',
  ['5.5 L/100 km', '8.7 L/100 km', '3.2 L/100 km', '6.2 L/100 km'],
  1,
  'The brochure rating is 9.4 city, 7.8 highway, 8.7 combined. 5.5 is rival-hybrid territory. 3.2 Le/100 km is the PHEV equivalent rating. 6.2 is the old Mirage. Quote 8.7, and say real-world use moves with winter, roof boxes and right feet.',
)
core(
  'ol-seats',
  'Outlander',
  'specs',
  'product',
  'How many people does a 2026 Outlander seat?',
  ['Five, like a RAV4', 'Six in most trims', 'Seven, in a 5+2 layout', 'Eight with the optional bench'],
  2,
  'Seven passengers, 5+2, standard. The third row is for kids and short hops. Second-row legroom is the adult row. Sell the seat you actually have.',
)
rotating(
  'ol-third',
  'Outlander',
  'specs',
  'trust',
  'A grandparent asks if the third row is comfortable for a drive to Whistler. The honest answer is:',
  [
    'Yes, it is a full-size third row, same as a Pilot',
    'Third-row legroom is about 475 mm, or 18.7 inches. Kids and short trips, yes. Adults to Whistler, fold it and use the cargo',
    'Nobody should ever sit back there',
    'Only the PHEV has a third row',
  ],
  1,
  'Brochure figure is 475 mm of third-row legroom. Overselling it is how you get the vehicle back on Monday. Both gas and PHEV Outlanders seat seven.',
)
rotating(
  'ol-cargo',
  'Outlander',
  'specs',
  'product',
  'Cargo volume behind the third row of a 2026 Outlander is:',
  ['308 litres', '866 litres', '1,822 litres', '64 litres'],
  0,
  '308 L behind the third row, 866 L behind the second, 1,822 L behind the fronts. 308 L is a couple of grocery bags, not a stroller plus luggage. Fold the third row before you promise the hockey-bag story.',
)
rotating(
  'ol-tow',
  'Outlander',
  'specs',
  'trust',
  'A customer wants to tow a small utility trailer with a gas Outlander. The published capacity is:',
  ['Up to 907 kg (2,000 lb)', 'Up to 2,268 kg (5,000 lb)', 'Towing is not allowed', '3,500 kg when equipped with the tow package'],
  0,
  'Up to 907 kg, and it varies by configuration. Do not invent a tow package that makes it a half-ton. Read the owner\'s manual limits with them if the trailer is close.',
)
core(
  'ol-airbags',
  'Outlander',
  'specs',
  'product',
  'How many airbags are standard on a 2026 Outlander?',
  ['6', '7', '11', '14'],
  2,
  'Eleven airbags are standard from ES. Eclipse Cross and RVR are specified with 7. Do not recycle one airbag count across the lineup.',
)
rotating(
  'ol-screen',
  'Outlander',
  'features',
  'benefit',
  'The centre screen on a 2026 Outlander ES is:',
  [
    '8-inch, wired CarPlay only',
    '12.3-inch smartphone-link display with wireless Apple CarPlay and Android Auto',
    '10.8-inch head-up display',
    'No screen until LE',
  ],
  1,
  '12.3 inches and wireless projection are ES equipment, plus the 8-speaker Yamaha. The HUD is GT. Lead with the phone they already own, then shut up and let them connect it.',
)
core(
  'war-basic',
  'Lineup',
  'warranty',
  'product',
  'Mitsubishi Canada\'s new-vehicle limited warranty is:',
  ['3 years / 60,000 km', '5 years / 100,000 km', '10 years / 160,000 km', '7 years / unlimited km'],
  1,
  'New-vehicle coverage is 5 years or 100,000 km, whichever comes first. The 10-year / 160,000 km promise is the powertrain warranty, not the whole vehicle. Say both numbers so a Hyundai shopper cannot catch you blending them.',
)
core(
  'war-pt',
  'Lineup',
  'warranty',
  'product',
  'The powertrain limited warranty on a new Mitsubishi in Canada is:',
  ['5 years / 100,000 km', '8 years / 130,000 km', '10 years / 160,000 km', '3 years / unlimited km'],
  2,
  '10 years or 160,000 km, whichever comes first. Maintenance is not included. This is the number that beats Toyota, Honda and Nissan powertrain coverage, which is 5 years / 100,000 km. Confirm any rival booklet if they push.',
)
core(
  'war-road',
  'Lineup',
  'warranty',
  'product',
  'Roadside assistance on a new Mitsubishi in Canada is:',
  ['3 years / 60,000 km', '5 years / unlimited kilometres', '10 years / 160,000 km', '1 year, then they pay'],
  1,
  '5 years of roadside assistance with unlimited kilometres. It is not the same as the 10-year powertrain warranty. Families hear "unlimited" and relax. Use the right label.',
)
core(
  'war-battery',
  'Outlander PHEV',
  'warranty',
  'phev',
  'The lithium-ion battery warranty on the Outlander PHEV is:',
  ['5 years / 100,000 km', '8 years / 160,000 km', '10 years / 160,000 km', '3 years / 60,000 km'],
  2,
  'PHEV and EV batteries are covered 10 years or 160,000 km, whichever comes first, under the battery limited warranty. That is the sentence that answers "the battery will cost me $20,000". Do not promise zero degradation.',
)
core(
  'war-which',
  'Lineup',
  'warranty',
  'trust',
  'A customer says "everything is 10 years, right?" You say:',
  [
    'Yes, bumper to bumper, ten years',
    'The powertrain is 10 years / 160,000 km. The vehicle warranty and roadside are 5 years. Whichever comes first, and maintenance is separate',
    'Warranty is whatever the other store offered',
    'Only the PHEV has a warranty',
  ],
  1,
  'Blending the two warranties is the fastest way to lose a detail-oriented buyer. Write the two numbers on the worksheet if you have to.',
)

core(
  'phev-range',
  'Outlander PHEV',
  'specs',
  'phev',
  'NRCan all-electric range for the 2026 Outlander PHEV is:',
  ['61 km', '72 km', '120 km', '690 km'],
  1,
  '72 km electric, up from 61 km on the previous pack. 690 km is the combined gas-plus-electric range, not the electric range. Winter, speed and heat will cut the 72. Say that before they do.',
)
core(
  'phev-battery',
  'Outlander PHEV',
  'specs',
  'phev',
  'The 2026 Outlander PHEV drive battery is:',
  ['20 kWh', '22.7 kWh lithium-ion', '64 kWh', '1.5 kWh mild-hybrid'],
  1,
  '22.7 kWh, up from 20 kWh. The tiny pack is the gas Outlander\'s 48-volt system, a completely different product. Do not call the gas Outlander a plug-in.',
)
core(
  'phev-hp',
  'Outlander PHEV',
  'specs',
  'phev',
  'Total system output claimed for the 2026 Outlander PHEV is:',
  ['131 hp', '174 hp', '248 hp from the gas engine', '297 hp'],
  3,
  'Mitsubishi Canada\'s 2026 media material rates total system output at 297 hp. The 2.4L engine itself is 131 hp. The gas Outlander is 174 hp. Do not quote the engine number as the system number.',
)
rotating(
  'phev-le',
  'Outlander PHEV',
  'specs',
  'phev',
  'The 2026 Outlander PHEV combined rating of 3.2 means:',
  [
    'It burns 3.2 litres of gasoline per 100 km even with an empty battery',
    '3.2 Le/100 km, a gasoline-equivalent rating. Gas-only operation is rated 8.6 L/100 km',
    '3.2 litres per kilometre',
    'It cannot use gasoline',
  ],
  1,
  'Le/100 km folds electricity into a gas-equivalent number. If you sell 3.2 as pump litres, the first road trip ruins you. Gas-only is 8.6 L/100 km city and highway in the 2026 release.',
)
rotating(
  'phev-total-range',
  'Outlander PHEV',
  'specs',
  'phev',
  'Combined driving range for the 2026 Outlander PHEV is about:',
  ['72 km', '400 km', '690 km', '1,000 km'],
  2,
  'About 690 km gas plus electric. 72 km is electric only. The tank was trimmed slightly versus the prior year to fit the larger battery, which is why the combined number barely moved.',
)
core(
  'phev-charge-l1',
  'Outlander PHEV',
  'specs',
  'phev',
  'From empty, a 2026 Outlander PHEV on a household 120-volt, 12-amp outlet takes about:',
  ['29 minutes', '2 hours', '6.5 hours', '16.5 hours'],
  3,
  'Level 1 is about 16.5 hours. Most commuters are not plugging in from empty every night. Ask how far they drive and where the car sleeps before you promise "it charges overnight" as a blanket.',
)
core(
  'phev-charge-l2',
  'Outlander PHEV',
  'specs',
  'phev',
  'Charge time on a 240-volt, 15-amp EVSE is about:',
  ['29 minutes to full', '6.5 hours', '16.5 hours', '45 minutes on any home dryer outlet, no electrician'],
  1,
  'About 6.5 hours on 240V / 15A. Do not tell a condo buyer they can share a dryer outlet. Charging hardware and strata approval are their project, not a feature you can throw in.',
)
core(
  'phev-dc',
  'Outlander PHEV',
  'specs',
  'phev',
  'DC quick charging on the 2026 Outlander PHEV is:',
  [
    'Not available in Canada',
    'A CCS port standard, 10 minutes to full',
    'CHAdeMO, about 29 minutes to roughly 80 percent',
    'Tesla NACS only',
  ],
  2,
  'The quick-charge port is CHAdeMO, about 29 minutes to 80 percent. It is not a 10-minute full charge, and it is not CCS. The ES equipment list includes the DC quick-charge port.',
)
core(
  'phev-pedal',
  'Outlander PHEV',
  'specs',
  'trust',
  'Innovative Pedal means:',
  [
    'The brake pedal can be removed',
    'Near one-pedal driving. You still use the brake to come to a complete stop',
    'The car drives itself in traffic',
    'A mode that only works on the highway',
  ],
  1,
  'The owner\'s handbook is explicit: regenerative and friction braking slow the vehicle, and the brake pedal is still required for a full stop. Demo it in the lot, then say that sentence.',
)
rotating(
  'phev-modes',
  'Outlander PHEV',
  'specs',
  'phev',
  'Which set is the 2026 Outlander PHEV S-AWC drive-mode list?',
  [
    'Eco, Normal, Tarmac, Snow, Mud, Gravel, Power',
    '2WD, 4WD Auto, 4WD Lock',
    'Normal, Snow, Gravel only',
    'Sport and Eco only',
  ],
  0,
  'Seven modes: Eco, Normal, Tarmac, Snow, Mud, Gravel and Power. 2WD / 4WD Auto / 4WD Lock is the RVR\'s AWC. Normal / Snow / Gravel is the Eclipse Cross.',
)
rotating(
  'phev-ev-save',
  'Outlander PHEV',
  'specs',
  'phev',
  'Battery Save mode does what?',
  [
    'Turns the gasoline engine off permanently',
    'Holds the current battery level and leans on the engine, so you can keep charge for later',
    'Fast-charges the car from a wall socket while driving',
    'Voids the battery warranty',
  ],
  1,
  'Save holds the state of charge for a later EV stretch, like a Whistler village or a downtown parkade. Charge mode uses the engine to fill the battery. EV mode is electric drive. Teach the three on the test drive, not in a monologue at the desk.',
)
rotating(
  'phev-series',
  'Outlander PHEV',
  'specs',
  'phev',
  'A customer says the gas engine never comes on if they plug in. You say:',
  [
    'Correct, it is an EV with a fake engine',
    'It prefers EV mode, and it will still start the engine for heat, hard acceleration, a low battery, or series and parallel hybrid driving',
    'The engine runs the whole time, the battery is just for show',
    'The engine only runs in Sport mode, which this vehicle does not have',
  ],
  1,
  'It is a series-parallel plug-in. EV mode is real. So is the engine. Honest beats magical. Ask what their coldest morning commute looks like.',
)
rotating(
  'phev-price-es',
  'Outlander PHEV',
  'pricing',
  'product',
  'MSRP for the 2026 Outlander PHEV ES S-AWC is:',
  ['$36,398', '$46,998', '$52,598', '$60,598'],
  1,
  'PHEV ES is $46,998 on mitsubishi-motors.ca. Gas ES is $36,398. PHEV SE is $52,598 and PHEV GT is $60,598. Freight, PDI and taxes are extra. Rebate eligibility is a separate question.',
)
rotating(
  'phev-price-noir',
  'Outlander PHEV',
  'pricing',
  'product',
  'The 2026 Outlander PHEV GT Noir S-AWC MSRP is:',
  ['$49,748', '$60,598', '$61,698', '$63,048'],
  3,
  'GT Noir PHEV is $63,048. GT is $60,598 and GT Premium is $61,698. The gas Noir at $49,748 is not this vehicle.',
)
rotating(
  'phev-es-kit',
  'Outlander PHEV',
  'trims',
  'product',
  'Which equipment is already on the 2026 PHEV ES, unlike the gas ES?',
  [
    'Innovative Pedal, DC quick charge, adaptive cruise, 12.3-inch digital cluster and 8-way power front seats',
    'Head-up display and 12-speaker audio',
    'Front seat massage',
    'Nothing. The PHEV ES is a blank base',
  ],
  0,
  'PHEV ES is well equipped: regen paddles, Innovative Pedal, S-AWC, DC quick charge, adaptive cruise, seven seats, power fronts, 12.3-inch centre screen, Yamaha 8-speaker and a 12.3-inch digital cluster. Massage is GT Premium / GT Noir. HUD is GT.',
)
rotating(
  'phev-massage',
  'Outlander PHEV',
  'trims',
  'product',
  'Front seat massage on the 2026 Outlander PHEV starts at:',
  ['ES', 'SEL', 'GT', 'GT Premium'],
  3,
  'Massage is a GT Premium and GT Noir feature, with the semi-aniline seats and the digital rearview mirror. Do not promise it on a GT.',
)
core(
  'phev-rebate',
  'Outlander PHEV',
  'pricing',
  'finance',
  'The website mentions a federal EV rebate. On the floor you:',
  [
    'Promise $2,500 off every PHEV tonight',
    'Confirm the current program, the trim, and that this customer qualifies before a dollar enters the quote',
    'Tell them rebates ended in 2024 and will never return',
    'Add the rebate on top of employee pricing without asking the desk',
  ],
  1,
  'Programs move. The ES has been the trim called out for the EV Affordability Program, and the site says eligible customers. You are not the statute. The desk confirms today\'s eligibility, then you quote.',
)
core(
  'phev-winter',
  'Outlander PHEV',
  'specs',
  'phev',
  'They ask if 72 km is guaranteed on a January morning in Port Coquitlam. You say:',
  [
    'Yes, NRCan tests in Canadian winter',
    '72 km is the NRCan rating. Cold, speed and cabin heat cut it. The engine covers the rest, which is why we size the car to their worst day',
    'Electric range doubles in the cold',
    'It will not move below zero',
  ],
  1,
  'Honesty keeps the PHEV sold after the first cold week. Ask where they park and how far the Wednesday commute is, not the Sunday average.',
)

const EC = ['ES S-AWC', 'SE S-AWC', 'Noir S-AWC', 'GT S-AWC']
function eclipse(id, feature, winner, why) {
  rotating(
    id,
    'Eclipse Cross',
    'trims',
    'product',
    `On the 2026 Eclipse Cross, ${feature} first shows up on which trim?`,
    EC,
    EC.indexOf(winner),
    why,
  )
}
eclipse('ec-fcm', 'Forward Collision Mitigation', 'ES S-AWC', 'FCM is standard on Eclipse Cross ES, along with 7 airbags, 18-inch alloys, heated fronts and rain-sensing wipers. Do not confuse this with the RVR, where FCM is a GT item.')
eclipse('ec-bsw', 'blind spot warning and rear cross traffic alert', 'SE S-AWC', 'BSW and RCTA arrive at SE, with LED fogs, dual-zone climate, FAST-Key, heated wheel and the hands-free liftgate.')
eclipse('ec-acc', 'adaptive cruise', 'Noir S-AWC', 'Adaptive cruise is listed on Noir, with the 360 camera, HUD, heated second row and 6-way power driver seat. The GT walk is published as SE equipment plus the roof, leather and remote starter. Read the GT sticker before you promise ACC on it.')
eclipse('ec-hud', 'a head-up display', 'Noir S-AWC', 'The HUD is listed on the Eclipse Cross Noir. If they also want the GT sunroof and leather, confirm the actual unit instead of assuming one trim contains both stories.')
eclipse('ec-roof', 'a power panoramic sunroof', 'GT S-AWC', 'The power panoramic roof with dual sunshades is GT. Noir has the tech look. GT has the roof, leather, remote starter and the 8-speaker power sound system.')
eclipse('ec-leather', 'leather-appointed seats', 'GT S-AWC', 'Leather-appointed seating is GT. Noir is microsuede. If the brief is "black wheels and leather", you may be mixing two trims. Say so and let them choose.')
eclipse('ec-remote', 'a remote starter', 'GT S-AWC', 'Remote starter is listed on the GT. It is a January feature in this city. Do not throw it in verbally on an ES.')

core(
  'ec-engine',
  'Eclipse Cross',
  'specs',
  'product',
  'The 2026 Eclipse Cross powertrain is:',
  [
    '1.5L turbo, 152 hp and 184 lb-ft, CVT, S-AWC on every trim',
    '2.0L, 148 hp, front-wheel drive on every trim',
    '2.4L plug-in, 72 km electric',
    '1.2L three-cylinder, 78 hp',
  ],
  0,
  'One engine for the whole Eclipse Cross lineup: 1.5L direct-injection turbo, 152 hp, 184 lb-ft available from 2,000 rpm, CVT, and S-AWC standard. That low-rpm torque is the merge onto Highway 1.',
)
rotating(
  'ec-fuel',
  'Eclipse Cross',
  'specs',
  'product',
  'NRCan fuel rating for the 2026 Eclipse Cross is:',
  ['9.6 city / 8.9 highway / 9.3 combined', '6.6 / 5.6 / 6.2', '9.4 / 7.8 / 8.7', '3.2 Le/100 km'],
  0,
  '9.6 / 8.9 / 9.3. The 8.7 combined figure is the gas Outlander. 6.2 is the Mirage. 3.2 is the PHEV equivalent rating.',
)
rotating(
  'ec-modes',
  'Eclipse Cross',
  'specs',
  'product',
  'Eclipse Cross S-AWC drive modes are:',
  ['Normal, Snow and Gravel', 'Eco, Tarmac, Mud and Power', '2WD, 4WD Auto, 4WD Lock', 'EV, Save and Charge'],
  0,
  'The 2026 brochure lists three: Normal, Snow and Gravel. Do not borrow the PHEV\'s seven-mode list or the RVR\'s 4WD Lock.',
)
rotating(
  'ec-seats',
  'Eclipse Cross',
  'specs',
  'trust',
  'A couple with three kids asks if the Eclipse Cross has a third row. You say:',
  [
    'Yes, all Mitsubishi SUVs seat seven',
    'No. Eclipse Cross is a five-seat compact. The seven-seat answer is Outlander',
    'Only the GT has a third row',
    'We can add a jump seat',
  ],
  1,
  'Five seats. If they need seven, change vehicles instead of changing the subject. The walk to the Outlander is the product knowledge.',
)
rotating(
  'ec-price-es',
  'Eclipse Cross',
  'pricing',
  'product',
  '2026 Eclipse Cross ES S-AWC MSRP is:',
  ['$24,998', '$29,798', '$33,298', '$38,898'],
  1,
  'ES is $29,798. SE is $33,298. Noir is $36,898. GT is $38,898. $24,998 is the RVR ES FWD. Do not let a price-ad shopper blend the two.',
)
rotating(
  'ec-price-gt',
  'Eclipse Cross',
  'pricing',
  'product',
  '2026 Eclipse Cross GT S-AWC MSRP is:',
  ['$33,298', '$36,898', '$38,898', '$42,198'],
  2,
  'GT is $38,898. Noir is $36,898, which can be higher-equipped on tech and lower on luxury. Explain the split before they assume GT means "everything".',
)
rotating(
  'ec-vs-rvr',
  'Eclipse Cross',
  'competitor',
  'benefit',
  'A shopper says the Eclipse Cross and the RVR are the same SUV with different faces. Your best correction is:',
  [
    'You are right, pick a colour',
    'Different size, different engine, different all-wheel system. Eclipse Cross is turbo S-AWC on every trim. RVR offers 2.0L or 2.4L and AWC, and the ES can be front-wheel drive',
    'The RVR is the fast one',
    'Only the price is different',
  ],
  1,
  'They are not twins. Eclipse Cross: 1.5T, S-AWC standard, five-seat compact. RVR: 2.0L on the ES trims, 2.4L on NOIR and GT, AWC with a lock mode, and a lower entry price. Ask what they actually drive.',
)

core(
  'rvr-not-sawc',
  'RVR',
  'specs',
  'trust',
  'A customer says "the RVR has S-AWC like the Outlander." You say:',
  [
    'Yes, same system, same button',
    'The RVR uses All-Wheel Control with 2WD, 4WD Auto and 4WD Lock. S-AWC is the Eclipse Cross and Outlander system',
    'Only the RVR GT has S-AWC',
    'S-AWC was cancelled',
  ],
  1,
  'AWC is real and useful, especially 4WD Lock on a slushy on-ramp. It is not S-AWC. Using the wrong name is how a forum post beats you later.',
)
rotating(
  'rvr-es-engine',
  'RVR',
  'specs',
  'product',
  'The 2026 RVR ES FWD and ES AWC use which engine?',
  ['1.5L turbo', '2.0L, 148 hp and 145 lb-ft', '2.4L, 168 hp', '1.2L, 78 hp'],
  1,
  'ES trims are the 2.0L, rated 148 hp and 145 lb-ft in the published specs, with a CVT. NOIR and GT step up to the 2.4L rated 168 hp and 167 lb-ft. Do not quote 168 hp on an ES.',
)
rotating(
  'rvr-gt-engine',
  'RVR',
  'specs',
  'product',
  'The 2026 RVR NOIR and GT use which engine?',
  ['2.0L, 148 hp', '2.4L, 168 hp and 167 lb-ft', '1.5L turbo, 174 hp', '2.4L plug-in'],
  1,
  'The 2026 RVR brochure rates NOIR and GT on the 2.4L at 10.3 / 8.3 / 9.4 L/100 km. That is the 168 hp engine. It is still not a turbo, and it is still not S-AWC.',
)
rotating(
  'rvr-fuel-fwd',
  'RVR',
  'specs',
  'product',
  'NRCan rating for the 2026 RVR ES FWD 2.0L is:',
  ['9.7 city / 7.8 highway / 8.8 combined', '6.2 combined', '8.7 combined', '3.2 Le/100 km'],
  0,
  '9.7 / 7.8 / 8.8 for ES FWD. ES AWC is thirstier, 10.1 / 8.2 / 9.2. If they want the lowest number in the RVR family, that is the front-wheel-drive ES, and you should ask whether they actually want AWC for the rain.',
)
rotating(
  'rvr-price-es',
  'RVR',
  'pricing',
  'product',
  'The 2026 RVR ES FWD MSRP starts at:',
  ['$16,998', '$24,998', '$26,998', '$29,798'],
  1,
  'ES FWD is $24,998. ES AWC is $26,998. Eclipse Cross ES is $29,798. $16,998 was the 2024 Mirage ES, which is not a current order.',
)
rotating(
  'rvr-price-awc',
  'RVR',
  'pricing',
  'product',
  'Stepping a 2026 RVR ES from FWD to AWC is an MSRP move from $24,998 to:',
  ['$25,498', '$26,998', '$28,998', '$31,498'],
  1,
  'ES AWC is $26,998. SE AWC is $28,998. SEL AWC is $31,498. Two thousand dollars is the drivetrain conversation, then you ask how they drive in December.',
)
rotating(
  'rvr-price-gt',
  'RVR',
  'pricing',
  'product',
  '2026 RVR GT AWC MSRP is:',
  ['$32,998', '$35,998', '$38,898', '$42,198'],
  1,
  'GT AWC is $35,998. NOIR AWC is $32,998. The GT is the one with leather, HomeLink, and the 710-watt Rockford Fosgate system with 9 speakers.',
)
rotating(
  'rvr-audio',
  'RVR',
  'features',
  'product',
  'The premium audio on a 2026 RVR GT is:',
  [
    'Yamaha Ultimate, 12 speakers',
    'Rockford Fosgate, 710 watts, 9 speakers plus a subwoofer',
    'The same 8-speaker system as the ES',
    'No audio package exists',
  ],
  1,
  'Rockford Fosgate, 710 watts, 9 speakers, on the GT. Yamaha is the Outlander. Mixing the brands makes you sound like you have never sat in the car.',
)
rotating(
  'rvr-screen',
  'RVR',
  'features',
  'product',
  'The RVR ES screen is:',
  ['12.3-inch', '10.8-inch HUD', '8-inch smartphone-link display with Apple CarPlay and Android Auto', 'No screen'],
  2,
  '8 inches on the RVR, with phone projection and a SiriusXM trial. The 12.3-inch screen is the Outlander. Sell the phone connection, not a screen size you do not have.',
)
rotating(
  'rvr-fcm',
  'RVR',
  'trims',
  'trust',
  'On the 2026 RVR, Forward Collision Mitigation and Lane Departure Warning are listed on:',
  ['Every trim', 'ES only', 'GT', 'They were deleted from the lineup'],
  2,
  'The GT equipment list is where FCM and LDW appear, along with leather and the Rockford system. Eclipse Cross includes FCM from ES. Do not borrow the Eclipse Cross safety list for a base RVR.',
)
rotating(
  'rvr-heated',
  'RVR',
  'features',
  'benefit',
  'Heated front seats on the RVR are:',
  ['GT only', 'Standard on ES', 'Not available', 'PHEV only'],
  1,
  'Heated fronts are on the ES list, with automatic climate and the 8-inch screen. That is a real base-trim benefit against a stripper rival. Mention it after you know they feel the cold, not before.',
)
rotating(
  'rvr-noir',
  'RVR',
  'trims',
  'product',
  'The 2026 RVR Noir adds which of these versus a plain SE?',
  [
    'A third row',
    'Black wheels, panoramic fixed glass, red stitch, black headliner and a Noir badge, at $32,998',
    'S-AWC and a turbo',
    'A plug-in battery',
  ],
  1,
  'Noir is an appearance and roof trim, MSRP $32,998, still an RVR. It does not become an Outlander. Red stitch and a black headliner are the cabin tells.',
)
rotating(
  'rvr-seats',
  'RVR',
  'specs',
  'trust',
  'Can you put seven people in a 2026 RVR?',
  [
    'Yes, 5+2',
    'No. Five seats. Seven means Outlander',
    'Only the GT',
    'Yes if you fold the cargo cover',
  ],
  1,
  'Five. The moment they say three kids in car seats, you are in an Outlander conversation or you are honest that two is the comfortable load.',
)

core(
  'mir-year',
  'Mirage',
  'lineup',
  'trust',
  'A first-time buyer asks to order a new Mirage. You say:',
  [
    'The 2026 Mirage ES is $16,998 and I can order one',
    '2024 was the final model year. New ones exist only while any remaining stock lasts. Certified used is the other path',
    'It was renamed RVR',
    'Mitsubishi cancelled the warranty on every Mirage',
  ],
  1,
  'Mitsubishi Canada has said production ended and 2024 is the last model year. Do not take an order for a car the factory is not building. If a new 2024 is actually on the ground, sell that unit, not a phantom allocation.',
)
rotating(
  'mir-price',
  'Mirage',
  'pricing',
  'product',
  'The 2024 Mirage ES CVT launched at an MSRP of:',
  ['$12,498', '$16,998', '$21,498', '$24,998'],
  1,
  'ES CVT $16,998, Noir $18,998, GT $21,498, before freight and PDI. That was the final-year price book, not a 2026 order guide. $24,998 is today\'s RVR ES FWD.',
)
rotating(
  'mir-engine',
  'Mirage',
  'specs',
  'product',
  'The 2024 Mirage engine is:',
  ['1.2L three-cylinder, 78 hp and 74 lb-ft, CVT, front-wheel drive', '1.5L turbo, AWD', '2.0L, 148 hp', 'A hybrid'],
  0,
  '1.2L, 78 hp, 74 lb-ft, CVT on every 2024 trim. The five-speed manual was dropped for that final year. It is front-wheel drive only. Great city commuter, not a mountain tool.',
)
rotating(
  'mir-fuel',
  'Mirage',
  'specs',
  'product',
  'The 2024 Mirage combined fuel rating is:',
  ['8.8 L/100 km', '6.2 L/100 km', '9.3 L/100 km', '3.2 Le/100 km'],
  1,
  '6.6 city, 5.6 highway, 6.2 combined, with a 35-litre tank. If someone mourns that number, the honest new-car pivot is a PHEV commute story or a frank RVR comparison, not a fake Mirage order.',
)
rotating(
  'mir-fcm',
  'Mirage',
  'trims',
  'product',
  'On the 2024 Mirage, Forward Collision Mitigation and Lane Departure Warning were:',
  ['Standard on ES', 'GT equipment', 'Not offered', 'Only on the manual'],
  1,
  'The features sheet lists LDW and FCM on the GT, not the ES or Noir. Same discipline as the RVR: safety equipment is a trim fact.',
)
rotating(
  'mir-warranty',
  'Mirage',
  'warranty',
  'trust',
  'An owner of a 2024 Mirage asks if the warranty vanished because production ended. You say:',
  [
    'Yes, discontinued cars lose their warranty',
    'No. The 5-year / 100,000 km vehicle warranty and 10-year / 160,000 km powertrain still apply under the original terms',
    'Only the powertrain remains, for 12 months',
    'They must buy an extended warranty this week or it is zero',
  ],
  1,
  'End of production is not end of warranty. Cover the original terms, whichever comes first, and do not use fear to sell a product they do not need.',
)
core(
  'mir-pivot',
  'Mirage',
  'lineup',
  'discovery',
  'They wanted a Mirage for the payment and the fuel bill. The useful next question is:',
  [
    'How about a used truck?',
    'How many kilometres a day, who rides along, and do you need all-wheel drive in the rain? Then we pick a real 2026, not a memory',
    'The Mirage is coming back next spring, wait',
    'You should buy a Corolla and leave',
  ],
  1,
  'Discovery first. A solo city driver and a parent who hits the Coquihalla are different vehicles. RVR ES FWD at $24,998 and the Outlander PHEV commute math are the two honest lanes.',
)

core(
  'say-rav4-fuel',
  'Outlander',
  'competitor',
  'competitor',
  'The customer says a RAV4 Hybrid uses way less fuel. You:',
  [
    'Tell them the Outlander beats it on fuel',
    'Agree. Then ask if they ever need a third row, and whether a 72 km electric commute in a PHEV would matter more than a hybrid that cannot plug in',
    'Insult Toyota reliability',
    'Switch them to a Mirage',
  ],
  1,
  'The RAV4 Hybrid\'s economy is real. Gas Outlander is 8.7 L/100 km combined. You lose the minute you argue the pump. Seats, S-AWC, the 10-year powertrain and the PHEV are the honest weapons.',
)
core(
  'say-crv',
  'Outlander',
  'competitor',
  'competitor',
  'Against a CR-V, the clean Outlander advantage to lead with is:',
  [
    'We have more horsepower than every CR-V hybrid',
    'Seven seats standard, S-AWC standard, and a 10-year / 160,000 km powertrain versus Honda\'s 5-year / 100,000 km powertrain',
    'We are always cheaper',
    'Honda is leaving Canada',
  ],
  1,
  'CR-V is five seats. Honda\'s Canadian powertrain coverage is 5 years / 100,000 km. Do not invent a fuel win against the CR-V Hybrid. Lead with the seat, the system and the warranty, then ask which of those they came in for.',
)
core(
  'say-rogue',
  'Outlander',
  'competitor',
  'competitor',
  'A Rogue shopper likes the name. Your strongest true contrast is:',
  [
    'Rogue also seats seven',
    'Outlander seats seven and includes S-AWC on every trim, with a longer powertrain warranty than Nissan\'s 5-year / 100,000 km coverage',
    'Nissan dealers cannot finance',
    'The Rogue has no airbags',
  ],
  1,
  'Rogue is a five-seat compact. Pathfinder is their three-row, and that is a different price. Keep the comparison on the vehicle they named.',
)
core(
  'say-tucson',
  'Outlander',
  'competitor',
  'competitor',
  'They say the Tucson has a better warranty and a plug-in hybrid too. You:',
  [
    'Say Hyundai has almost no warranty',
    'Give Hyundai its 5-year / 100,000 km coverage, then separate it from a 10-year powertrain, seven seats and standard S-AWC. A Tucson plug-in still does not add a third row',
    'Claim the Tucson is front-wheel drive only',
    'Refuse to talk about Hyundai',
  ],
  1,
  'Hyundai Canada\'s comprehensive warranty is a real 5-year / 100,000 km. Respect it. The opening is powertrain length, the third row, and S-AWC. Pretending they have no warranty makes you the person who does not know the market.',
)
core(
  'say-cx5',
  'Outlander',
  'competitor',
  'competitor',
  'A CX-5 driver says Mazda is more fun. You:',
  [
    'Argue that Outlander out-handles a CX-5 on a track',
    'Let them have the steering feel. Ask whether they need seven seats, a plug-in commute, or a 10-year powertrain Mazda does not match',
    'Tell them Mazda is for people who cannot afford Mitsubishi',
    'Offer a free roof rack if they stop talking',
  ],
  1,
  'CX-5 wins some buyers on the drive. Do not fake that. Move to space, the PHEV, S-AWC and warranty. Fun is not the only reason a family signs.',
)
rotating(
  'say-kona',
  'RVR',
  'competitor',
  'competitor',
  'They are cross-shopping a Hyundai Kona. You position the RVR by:',
  [
    'Claiming the RVR ES out-accelerates the Kona Electric',
    'Price from $24,998, heated seats standard, available AWC with a lock mode, and the longer powertrain warranty. Ask gas versus electric before you pitch',
    'Saying Kona has no dealers in B.C.',
    'Quoting Outlander third-row space',
  ],
  1,
  'Kona is the right rival for RVR and sometimes Eclipse Cross, not a seven-seat story. If they want an EV, do not pretend the RVR is one. If they want a cheap AWC commuter, the RVR has a clear price door.',
)
rotating(
  'say-hrv',
  'RVR',
  'competitor',
  'competitor',
  'Against an HR-V, a fair RVR point is:',
  [
    'We have a third row and a turbo on the ES',
    'A lower opening price, heated seats on ES, and AWC with 4WD Lock. Eclipse Cross is the one with standard S-AWC and turbo torque if they want that instead',
    'Honda has no safety equipment',
    'HR-V cannot be financed',
  ],
  1,
  'HR-V is five seats, naturally aspirated, available AWD without a lock mode. Do not give the RVR a turbo it does not have. If they want turbo and S-AWC, walk to the Eclipse Cross.',
)
rotating(
  'say-cc',
  'Eclipse Cross',
  'competitor',
  'competitor',
  'A Corolla Cross Hybrid shopper leads with fuel. You:',
  [
    'Claim Eclipse Cross uses less fuel',
    'Agree the hybrid is thrifty. Then talk 184 lb-ft from 2,000 rpm, standard S-AWC, and a 10-year powertrain versus Toyota\'s 5-year / 100,000 km',
    'Tell them Toyota dealers will not take their trade',
    'Promise a Mirage on order',
  ],
  1,
  'Corolla Cross Hybrid economy is the reason they walked in. Acknowledge it. Torque, standard S-AWC and the powertrain warranty are the Mitsubishi answers. The RVR is the price answer if the Eclipse Cross payment scares them.',
)
core(
  'say-value',
  'Lineup',
  'competitor',
  'objection',
  'They say Toyota holds its value and Mitsubishi does not. Best move:',
  [
    'Guarantee a residual three years from now',
    'Do not fight the reputation with a promise. Put the 10-year powertrain, the equipment they will use, and today\'s payment next to the Toyota quote, and let the desk show the ownership math',
    'Say resale does not matter to anyone',
    'Knock $3,000 off without a manager',
  ],
  1,
  'You do not control the auction three years out. You do control an honest comparison of warranty, equipment and payment. Promising resale is how a review gets written.',
)
core(
  'say-cvt',
  'Lineup',
  'objection',
  'objection',
  '"I hate CVTs." You:',
  [
    'Say this one is actually an 8-speed automatic',
    'Acknowledge the reputation, explain this one is a CVT, and offer the drive so they can judge shift feel and the paddle behaviour themselves',
    'Tell them CVTs never fail and the warranty is pointless',
    'Refuse the test drive until they apologize',
  ],
  1,
  'The gas Outlander, Eclipse Cross, RVR and the final Mirage use CVTs. Lying about the gearbox is a one-way trip to a cancelled deal. The 10-year powertrain is the safety net you can actually point at, after the drive.',
)
core(
  'say-awd',
  'Outlander',
  'objection',
  'benefit',
  '"AWD is AWD." You:',
  [
    'Agree and change the subject to colour',
    'Ask where they drive in weather, then show the mode that matches: Snow or Gravel on S-AWC, or 4WD Lock on an RVR. Offer the route, not a slogan',
    'Say only Mitsubishi can drive in snow',
    'Claim S-AWC is a locking differential on all four wheels at all times',
  ],
  1,
  'S-AWC is a control system with selectable modes, not a magic locker and not "the same as every AWD". The demo is the Pitt River bridge in the rain, described honestly, or a slow cone in the lot if the sky is clear.',
)
core(
  'say-surrey',
  'Lineup',
  'objection',
  'objection',
  'They flash a Surrey ad and say it is cheaper. Your first move is:',
  [
    'Match the number on the spot from your own pocket',
    'Put the two quotes side by side: year, trim, kilometres, fees, colour, and in-stock versus incoming. If theirs is truly lower on the same car, involve the desk before they drive an hour',
    'Tell them Surrey ads are fake and the store is untrustworthy',
    'Tell them to go to Surrey',
  ],
  1,
  'Price objections get solved by isolation, not by volume. Same car, same fees, then a decision. You do not have unilateral discount authority, and you do not trash another store.',
)
core(
  'say-payment',
  'Lineup',
  'objection',
  'finance',
  'The payment is $40 over their ceiling. First lever conversation is:',
  [
    'Stretch the term as far as it will go and hide the total',
    'Ask which lever they can move: down payment, term, trim, or rate. Show two options and the total cost of each',
    'Tell them to come back when they have more money',
    'Promise the manufacturer will cut the MSRP tonight',
  ],
  1,
  'Payment is a structure, not a mood. Term stretches raise the total. A trim step-down might keep the feature they actually use. The desk runs the numbers. You do not invent a rate.',
)
core(
  'say-rate',
  'Lineup',
  'objection',
  'finance',
  'They have a credit-union pre-approval and assume your rate is a markup. You:',
  [
    'Tell them dealer rates are always higher, so use the bank',
    'Ask the term and the rate they were quoted. Compare honestly. If the bank wins, say so. Keep the car decision separate from the lender decision',
    'Refuse to deliver unless they finance in the office',
    'Add a point without telling them',
  ],
  1,
  'A clean rate comparison builds more trust than a trapped lender. Protection products stay optional. The PHEV rebate, if any, still has to be checked against the program, not against your enthusiasm.',
)
core(
  'say-trade',
  'Lineup',
  'objection',
  'trade',
  'They are sure you will lowball the trade. You:',
  [
    'Name a number off the top of your head to calm them',
    'Explain the appraisal is a market number, ask what they need the deal to do, and do not insult the car they maintained',
    'Say trades are a waste of time and to sell it privately or leave',
    'Promise you will beat any number by $1,000 before you see the car',
  ],
  1,
  'The appraisal is a process: walkaround, history, wholesale reality. A number you invent in the aisle becomes the number they remember. Respect the car. Then let the appraiser work.',
)
core(
  'say-upside',
  'Lineup',
  'objection',
  'trade',
  'They owe more than the trade is worth. You:',
  [
    'Pretend the negative equity disappeared',
    'Name it. Show how much rolls, what it does to the payment, and the option of writing a cheque so the new loan stays healthy',
    'Tell them the bank will not notice',
    'Refuse to speak to anyone with negative equity',
  ],
  1,
  'Buried equity is math. Hiding it inside a long term is how people end up upside-down twice. Put the number on the paper.',
)
core(
  'say-think',
  'Lineup',
  'objection',
  'close',
  '"I need to think about it." You:',
  [
    'Say "no problem" and hand them a brochure with no next step',
    'Agree, then ask what the open item is: payment, partner, trade, or a feature. Book the next step before they reach the door',
    'Tell them the car will be gone in an hour no matter what, even if you have ten',
    'Follow them to the parking lot arguing',
  ],
  1,
  'A stall is usually one unmade decision. Isolate it. A fake scarcity line on a car you have in depth costs you the relationship. A real incoming-unit story, told accurately, is fine.',
)
core(
  'say-spouse',
  'Lineup',
  'objection',
  'close',
  '"My spouse has to see it." You:',
  [
    'Pressure them to sign before the spouse arrives',
    'Treat the spouse as a real buyer. Offer a time today or tonight when both can drive it, and send the exact stock card so the conversation at home is accurate',
    'Tell them spouses always say no, decide now',
    'Give them a different colour to speed it up',
  ],
  1,
  'The absent decision-maker is not an obstacle to trick. Get both of them in the vehicle. The stock number, trim and payment range you send home should match what you said on the lot.',
)
core(
  'say-email',
  'Lineup',
  'objection',
  'close',
  '"Just email me a quote." You:',
  [
    'Send a bare MSRP and wait',
    'Ask what they want compared, confirm the trim and the taxes they care about, and book a time to review the quote together so the email is not a ghost',
    'Refuse to email anything',
    'Email three payments with no term, no down and no disclaimers',
  ],
  1,
  'An unanchored email becomes a screenshot in a Surrey thread. Build the quote with them, label what is included, and put a next appointment on it.',
)
core(
  'say-20min',
  'Lineup',
  'objection',
  'discovery',
  'They have 20 minutes on a lunch break. You:',
  [
    'Start a 40-minute feature tour of every trim',
    'Ask the one job the vehicle must do, show that one thing, and book the longer drive',
    'Tell them to come back when they are serious',
    'Skip discovery and present a GT because the gross is better',
  ],
  1,
  'Short visits die in monologues. One use-case, one vehicle, one next step. The gross does not pick the car. Their Wednesday does.',
)
core(
  'say-cheap-feel',
  'Outlander',
  'objection',
  'trust',
  'They drove a 2016 Outlander and remember hard plastics. You:',
  [
    'Say nothing has changed',
    'Agree the old one felt dated, then sit them in the 2026 and let the screen, the seats and the quiet do the work. Ask what specifically bothered them',
    'Argue that 2016 was the best interior in the segment',
    'Apologize and switch them to another brand',
  ],
  1,
  'The 2026 cabin is a different product: 12.3-inch screen, Yamaha audio, available leather and a much quieter brief from the factory. Nostalgia cuts both ways. Let the car answer, after you ask which part felt cheap.',
)
core(
  'say-wait-27',
  'Outlander',
  'objection',
  'close',
  '"I will wait for the next model year." You:',
  [
    'Knock the 2026 so they feel smart for waiting',
    'Ask what they want that this one lacks. If the 2026 does the job, the warranty starts when they drive home, and a future model does not haul kids in the meantime',
    'Promise the redesign will be cheaper',
    'Say there will never be another Outlander',
  ],
  1,
  'A 2027 can exist without making the in-stock 2026 wrong. Do not badmouth your own inventory and do not invent the next car\'s price. Find the feature they think they are waiting for.',
)
core(
  'say-noir-swirl',
  'Outlander',
  'objection',
  'trust',
  'They love Noir black and worry about swirl marks. You:',
  [
    'Say black paint never swirls',
    'Agree black shows wash marks. Talk wash habits, and still sell the look if they want it. Do not promise a ceramic package you have not cleared',
    'Refuse to sell black cars',
    'Tell them to buy white and stop worrying',
  ],
  1,
  'Black is honest work. Noir is a styling choice, from the wheels to the headliner, not a different paint technology. Accessories get priced by the desk.',
)
core(
  'say-tires',
  'Lineup',
  'objection',
  'close',
  '"Throw in winter tires." You:',
  [
    'Say yes, you will pay for them personally',
    'Acknowledge a B.C. winter needs real tires, tell them the car comes with all-seasons, and ask the desk what a tire package costs before you promise it',
    'Say winter tires are illegal on a Mitsubishi',
    'Claim S-AWC replaces winter tires',
  ],
  1,
  'S-AWC is not a tire. All-seasons are not winters. Quote a package or do not offer one. The Coast is wet more often than it is deep-snow, and the mountains are a different drive.',
)
core(
  'say-lease',
  'Lineup',
  'finance',
  'finance',
  'They want to lease, not finance. You:',
  [
    'Talk them out of it because finance gross is better',
    'Ask kilometres per year, how long they keep cars, and whether they want a guaranteed residual. Then let the desk build lease and finance side by side',
    'Quote a lease payment with a 12,000 km cap without asking how far they drive',
    'Say Mitsubishi cannot lease in B.C.',
  ],
  1,
  'Kilometres decide a lease. A PoCo-to-Vancouver commuter can blow a low-cap lease by summer. Ask the driving before the payment.',
)
core(
  'say-web-pay',
  'Lineup',
  'pricing',
  'finance',
  'The site shows a weekly payment with employee pricing. You:',
  [
    'Quote that weekly number as their payment',
    'Treat the ad as a campaign with conditions. The desk quotes this customer, this stock unit, and today\'s rate',
    'Say the website is lying',
    'Offer that payment on a different trim to make it work',
  ],
  1,
  'Campaigns on mitsubishi-motors.ca include eligibility, term and down-payment assumptions. The $ figure in the ad is not a promise. Your job is to get a real worksheet.',
)
core(
  'say-fees',
  'Lineup',
  'pricing',
  'trust',
  'They compare an MSRP you quoted with an out-the-door number from another ad. You:',
  [
    'Insist MSRP is the on-the-road price',
    'Separate MSRP from freight, PDI, taxes, levies and any products. Build both quotes the same way',
    'Add hidden fees later',
    'Drop taxes because they asked nicely',
  ],
  1,
  'MSRP excludes freight, PDI, taxes and fees. A surprise documentation line at the end undoes an hour of good work. Line-item both quotes.',
)
rotating(
  'say-feature-dump',
  'Lineup',
  'skill',
  'benefit',
  'You have 90 seconds beside an Outlander SEL. The skilled version is:',
  [
    'Read every feature on the monroney from the roof down',
    'Pick the two features that match what they told you, translate each into their week, and ask if that is the one',
    'Talk only about horsepower',
    'Hand them the brochure and check your phone',
  ],
  1,
  'Feature-to-benefit is a choice. Heated second row matters if a parent rides in back. It is noise if they drive alone. Discovery first, then two features, then a question.',
)
rotating(
  'say-demo',
  'Outlander',
  'skill',
  'discovery',
  'Before a test drive, the question that most changes the route is:',
  [
    'Do you like red?',
    'Where will this car be on a normal Tuesday, and who is in it?',
    'What is your credit score, right here in the showroom?',
    'Why did you waste time at the other store?',
  ],
  1,
  'Tuesday picks the car. A school run, a job site and a Whistler Friday are three demos. Credit belongs in a private office, later, and not as a trap.',
)
rotating(
  'say-silence',
  'Lineup',
  'skill',
  'close',
  'You asked "If the numbers land where we discussed, are you taking it home today?" They go quiet. You:',
  [
    'Fill the silence with a new discount',
    'Wait. Then ask which part snagged',
    'Announce they have lost the car',
    'Walk away without a next step',
  ],
  1,
  'Silence after a close is working. A nervous discount teaches them that the first number was fiction. Wait, then isolate.',
)
rotating(
  'ol-vs-phev-which',
  'Outlander',
  'specs',
  'discovery',
  'Who is the better gas-versus-PHEV question aimed at?',
  [
    'Anyone who looks wealthy',
    'Someone whose daily kilometres fit inside a reduced winter electric range, and who can plug in where they sleep',
    'Everyone, because the PHEV payment is always lower',
    'Nobody. PHEV is a specialty car for fleets only',
  ],
  1,
  'Daily distance plus a plug decides the PHEV. A 45 km Port Coquitlam to downtown loop is the textbook case. A 180 km day with no outlet is a gas Outlander conversation. Payment is not automatically lower.',
)
rotating(
  'ol-yamaha-which',
  'Outlander',
  'features',
  'product',
  'A music fan asks which Outlander has Yamaha audio. You say:',
  [
    'Only the GT',
    'Every 2026 Outlander has Yamaha. ES through SEL are the 8-speaker Premium system. GT steps to the 12-speaker Ultimate system',
    'Yamaha was replaced by Rockford Fosgate on the Outlander',
    'Audio is a dealer-installed extra on all trims',
  ],
  1,
  'Yamaha is standard across the gas Outlander. The upgrade is the speaker count at GT. Rockford Fosgate is the RVR GT. Play their song for ten seconds, then stop talking.',
)
rotating(
  'ol-regular',
  'Lineup',
  'specs',
  'product',
  'Which statement is safe to tell a fuel buyer?',
  [
    'Every number I remember is a guarantee',
    'NRCan ratings are comparison tools. I will show you the rating for the exact trim, and your result will move with weather, load and speed',
    'All Mitsubishi vehicles use 3.2 L/100 km',
    'Premium fuel is required in every model and is included for life',
  ],
  1,
  'Ratings are for comparison. The footnote on mitsubishi-motors.ca says actual results vary. Quoting the right trim\'s number, with that sentence, is the professional version.',
)
rotating(
  'safety-limit',
  'Lineup',
  'features',
  'trust',
  'You are about to demo a driver aid. You also say:',
  [
    'The car will brake and steer for you, so you can check texts',
    'These are aids with limits. The driver is responsible. Hands stay on the wheel',
    'Forward collision means a crash is impossible',
    'Lane departure prevention is self-driving',
  ],
  1,
  'Mitsubishi\'s own language: aids are not a substitute for careful driving, and they have limits. You protect the customer and the store by saying it before the demo, not after a scare.',
)
rotating(
  'delivery-connect',
  'Outlander',
  'features',
  'benefit',
  'At delivery of an LE, the thing you do not skip is:',
  [
    'A second full feature tour of trims they did not buy',
    'Phone pairing, Mitsubishi Connect enrollment, and a check that the features they bought actually work on this unit',
    'Asking them to leave a review before they sit in the seat',
    'Nothing. Delivery is paperwork only',
  ],
  1,
  'Connect requires enrollment. An unpaired phone becomes "the car is too complicated" by Thursday. Delivery is the last selling skill, not a clerical chore.',
)
rotating(
  'color-roof',
  'Outlander',
  'trims',
  'product',
  'A buyer wants a two-tone roof on a 2026 Outlander. You:',
  [
    'Promise every colour can be ordered with a black roof by Friday',
    'Check the actual two-tone availability for this model year and this stock. White Diamond, Red Diamond, Black Diamond and Moonstone Grey have been offered with contrast roofs. Confirm the unit',
    'Say two-tone was cancelled in 2019',
    'Paint it in the detail bay tonight',
  ],
  1,
  'The 2026 brochure shows contrast roofs on specific colours, including Red Diamond, White Diamond, Black Diamond and Moonstone Grey. Availability is a stock question. Do not repaint a car in conversation.',
)
rotating(
  'phev-seats-same',
  'Outlander PHEV',
  'specs',
  'product',
  'Does the 2026 Outlander PHEV keep the third row?',
  [
    'No, the battery deletes it',
    'Yes. Seven-passenger seating is listed on the PHEV, and the battery is packaged under the floor',
    'Only as a dealer accessory',
    'The third row is forward-facing child seats only, legally',
  ],
  1,
  'The 2026 release is explicit that the larger battery sits under the floor and does not take the interior. Seven seats remain. The third-row comfort limit is the same honest conversation as the gas model.',
)
rotating(
  'phev-motors',
  'Outlander PHEV',
  'specs',
  'phev',
  'The 2026 PHEV all-wheel system is driven by:',
  [
    'A driveshaft only, same as the gas model',
    'Twin AC motors, front and rear, with S-AWC',
    'Rear motor only',
    'A viscous coupling and no electric motors',
  ],
  1,
  'Twin motors, front and rear, are the PHEV\'s S-AWC layout. The brochure lists motor output separately from the 2.4L engine. That is why it can drive electrically with traction at both axles.',
)
rotating(
  'ec-heat',
  'Eclipse Cross',
  'features',
  'benefit',
  'Heated front seats on the Eclipse Cross are:',
  ['GT only', 'Standard on ES', 'Not available', 'A PHEV exclusive'],
  1,
  'Heated fronts are on the ES list. Heated rear seats wait for Noir. Lead with fronts if they mentioned cold hands, and step to Noir only if the kids in back are the actual complaint.',
)
rotating(
  'rvr-lock',
  'RVR',
  'specs',
  'benefit',
  'When would you recommend 4WD Lock on an RVR?',
  [
    'Highway cruising at 110 to improve fuel economy',
    'Low-speed slippery surfaces, snow or a rough patch, then back to Auto or 2WD on dry pavement',
    'All day, every day, because lock is the normal mode',
    'Only when towing 5,000 lb',
  ],
  1,
  'The brochure describes 4WD Lock as the always-on split for slippery surfaces, and 2WD as the dry-pavement economy mode. Teach the button. Do not leave them in Lock forever.',
)
rotating(
  'ol-paddle',
  'Outlander',
  'features',
  'product',
  'Paddle shifters on the 2026 gas Outlander are:',
  ['Not offered', 'Standard, on the CVT', 'GT only', 'A manual transmission option'],
  1,
  'The CVT includes paddle shifters across the gas Outlander trims in the 2026 brochure. They select ratios. They do not turn the car into a manual. On the PHEV the paddles also manage regenerative braking.',
)
rotating(
  'ol-startstop',
  'Outlander',
  'specs',
  'product',
  'A customer thinks the 2026 gas Outlander has stalled at a light. You explain:',
  [
    'The battery is dead, do not buy it',
    'Auto start-stop, part of the 48-volt mild hybrid. It shuts the engine off at a full stop and restarts when the brake releases',
    'That only happens on the PHEV',
    'It is a fault they should ignore forever',
  ],
  1,
  'The mild-hybrid start-stop is supposed to be quiet. Show them once on the drive so the first downtown light does not feel like a breakdown.',
)
rotating(
  'desk-ownership',
  'Lineup',
  'pricing',
  'finance',
  'Who is allowed to invent a payment on the spot?',
  [
    'Anyone who has done this for a year',
    'Nobody. You gather the term, down payment, kilometres and trade picture. The desk calculates',
    'The customer, if they saw a YouTube video',
    'Only on Saturdays',
  ],
  1,
  'A verbal payment that the worksheet cannot hit is a broken promise. Skill is knowing which four facts the desk needs, and not freelancing the fifth.',
)
rotating(
  'kids-seats',
  'Outlander',
  'skill',
  'discovery',
  'Two car seats and a teenager. Which question matters before you pick gas Outlander or Eclipse Cross?',
  [
    'What is your favourite colour?',
    'Do all three kids ride at once, how often, and does a teenager need the third row or will two rows and cargo do?',
    'Do you care about badges?',
    'Which store did you visit in Surrey?',
  ],
  1,
  'Three kids at once is the Outlander. Two kids and a dog and a stroller may be happier in a five-seat with the third row not eating the trunk. Ask the week, not the category.',
)
rotating(
  'phev-precondition',
  'Outlander PHEV',
  'features',
  'phev',
  'A useful PHEV habit you can teach at delivery is:',
  [
    'Warm the cabin on battery while parked so the range is gone before they leave',
    'Pre-condition while plugged in, when the setup allows, so heat comes from the wall instead of the morning range',
    'Never plug it in, to save the battery',
    'Discharge to zero every night to calibrate',
  ],
  1,
  'The 2026 charging notes include scheduling a charge and using climate while connected. That is a real winter tip. "Run it to zero nightly" is not.',
)
rotating(
  'honest-stock',
  'Lineup',
  'skill',
  'trust',
  'The colour they want is incoming, not on the ground. You:',
  [
    'Say it is out back',
    'Show the ETA you actually have, offer a comparable in-stock unit, and do not lock a deal to a date the factory has not confirmed',
    'Tell them incoming units are cancelled',
    'Sell them a different brand\'s car off the street',
  ],
  1,
  'Stock honesty is a selling skill. A made-up ETA becomes a Saturday meltdown. In-stock loses to the right car sometimes, and that is fine if the next step is real.',
)
rotating(
  'greet-order',
  'Lineup',
  'skill',
  'discovery',
  'The first minute on the lot, in order, is:',
  [
    'Price, credit, manager, close',
    'Welcome, names, what they want the vehicle to do, then one car that fits',
    'Feature dump, then ask if they are buying today',
    'Hand them to the next rep because you are busy',
  ],
  1,
  'Greeter is a rank, not a waiting room. The first minute sets trust. Use their name, find the job of the car, then walk. Product knowledge without a question is a speech.',
)
rotating(
  'ol-tow-ask',
  'Outlander',
  'specs',
  'discovery',
  'They mention a trailer. Before you quote 907 kg you ask:',
  [
    'Nothing. 907 kg covers every trailer in B.C.',
    'What the trailer weighs loaded, how often, and whether the hitch and brakes match the manual',
    'Whether they want the Noir appearance package',
    'If they would rather look at a competitor\'s half-ton',
  ],
  1,
  '907 kg is the published gas Outlander figure and it varies by configuration. A loaded toy trailer can blow it. Ask the weight. Then read the manual together if it is close.',
)
rotating(
  'ec-snow',
  'Eclipse Cross',
  'specs',
  'benefit',
  'On an Eclipse Cross, the mode you select for a slushy morning is:',
  ['Power', 'Snow', '4WD Lock', 'EV Priority'],
  1,
  'Snow is one of the three Eclipse Cross S-AWC modes. 4WD Lock is the RVR. Power and EV Priority are PHEV language. Use the button this vehicle has.',
)
rotating(
  'badge-noir-meaning',
  'Lineup',
  'trims',
  'product',
  'Across the 2026 lineup, Noir generally means:',
  [
    'A plug-in powertrain',
    'A blacked-out appearance package on that model, not an engine upgrade',
    'The cheapest trim',
    'A limited manual transmission',
  ],
  1,
  'Noir on Outlander, Eclipse Cross and RVR is styling: black wheels, badges, dark trim. Check the specific equipment list because the tech content is not identical from model to model.',
)
rotating(
  'who-confirms-price',
  'Lineup',
  'pricing',
  'trust',
  'Where does a guest confirm a price you are not sure of?',
  [
    'A memory from last April',
    'The current mitsubishi-motors.ca build, then the desk for this unit\'s out-the-door figure',
    'A forum signature',
    'Whatever the other brand\'s ad says',
  ],
  1,
  'MSRP changes. Campaigns change. The public build is the anchor and the desk is the out-the-door number. Guessing a price is not product knowledge.',
)

rotating(
  'ol-price-le',
  'Outlander',
  'pricing',
  'product',
  'MSRP of the 2026 Outlander LE S-AWC is:',
  ['$39,098', '$42,198', '$44,898', '$47,398'],
  1,
  'LE is $42,198. SE is $39,098, SEL is $44,898, GT is $47,398. The 360 camera and adaptive cruise live at LE, which is why the step from SE is a safety-and-tech conversation, not a paint conversation.',
)
rotating(
  'ol-price-sel',
  'Outlander',
  'pricing',
  'product',
  'MSRP of the 2026 Outlander SEL S-AWC is:',
  ['$42,198', '$44,898', '$47,398', '$48,398'],
  1,
  'SEL is $44,898. That is the leather, ventilated seat, heated second row, memory and 20-inch wheel step. GT Premium is $48,398.',
)
rotating(
  'ol-price-gtp',
  'Outlander',
  'pricing',
  'product',
  'MSRP of the 2026 Outlander GT Premium S-AWC is:',
  ['$47,398', '$48,398', '$49,748', '$61,698'],
  1,
  'GT Premium is $48,398. Noir is $49,748. $61,698 is the PHEV GT Premium. Same adjectives, different powertrains, very different money.',
)
rotating(
  'phev-price-se',
  'Outlander PHEV',
  'pricing',
  'product',
  'MSRP of the 2026 Outlander PHEV SE S-AWC is:',
  ['$46,998', '$52,598', '$54,798', '$57,598'],
  1,
  'PHEV SE is $52,598. ES is $46,998, LE is $54,798, SEL is $57,598. The SE still brings the sunroof, heated wheel, wireless charger and hands-free liftgate.',
)
rotating(
  'ec-price-se',
  'Eclipse Cross',
  'pricing',
  'product',
  'MSRP of the 2026 Eclipse Cross SE S-AWC is:',
  ['$29,798', '$33,298', '$36,898', '$38,898'],
  1,
  'SE is $33,298. That step adds blind-spot warning, rear cross traffic, dual-zone climate, FAST-Key and the heated wheel. Noir is $36,898 and GT is $38,898.',
)
rotating(
  'rvr-price-se',
  'RVR',
  'pricing',
  'product',
  'MSRP of the 2026 RVR SE AWC is:',
  ['$26,998', '$28,998', '$31,498', '$32,998'],
  1,
  'SE AWC is $28,998. ES AWC is $26,998. SEL is $31,498. Noir is $32,998. SE adds blind-spot warning, rear cross traffic, 16-inch alloys, privacy glass and a leather-wrapped wheel.',
)
rotating(
  'not-a-plug',
  'Outlander',
  'specs',
  'trust',
  'A guest calls the gas Outlander a plug-in because they heard "hybrid". You say:',
  [
    'Yes, there is a plug behind the badge',
    'The gas Outlander is a 48-volt mild hybrid. It does not plug in. The vehicle you plug in is the Outlander PHEV',
    'Mild hybrid means 72 km of electric range',
    'Both versions use the same 22.7 kWh battery',
  ],
  1,
  '48-volt assistance and auto start-stop are not a plug-in. The PHEV has the 22.7 kWh pack, the port and the 72 km rating. Mixing the names creates a delivery that feels like a bait and switch.',
)
rotating(
  'ol-tank',
  'Outlander',
  'specs',
  'product',
  'Fuel-tank capacity on the 2026 gas Outlander is:',
  ['35 L', '55 L', '80 L', '22.7 kWh'],
  1,
  '55 litres. 35 litres was the Mirage. Kilowatt-hours are not litres. At 8.7 L/100 km combined, 55 litres is the highway math you only do after you have quoted the rating honestly.',
)
rotating(
  'ec-airbags',
  'Eclipse Cross',
  'specs',
  'product',
  'Airbags standard on the 2026 Eclipse Cross are:',
  ['4', '7', '11', '2'],
  1,
  'Seven airbags on the Eclipse Cross. The Outlander is the one with 11. Safety counts are not a place to round up.',
)
rotating(
  'rvr-wheels',
  'RVR',
  'trims',
  'product',
  'The 2026 RVR ES rolls on:',
  ['20-inch two-tone alloys', '18-inch black alloys', '16-inch steel wheels with covers', '15-inch Mirage alloys'],
  2,
  'ES is 16-inch steel with wheel covers. SE moves to 16-inch alloys. SEL and above go to 18-inch. If alloys matter, you are not presenting an ES.',
)
rotating(
  'ec-wheels',
  'Eclipse Cross',
  'trims',
  'product',
  'Wheel size standard on the 2026 Eclipse Cross ES is:',
  ['16-inch steel', '18-inch alloy', '20-inch alloy', '14-inch'],
  1,
  '18-inch alloys are on the ES. Noir paints them black. You do not have to apologize for the ES wheels.',
)
rotating(
  'sawc-all-ec',
  'Eclipse Cross',
  'specs',
  'product',
  'Which Eclipse Cross trims include S-AWC?',
  ['GT only', 'Noir and GT', 'Every trim', 'None. That is an Outlander exclusive'],
  2,
  'S-AWC is standard on every 2026 Eclipse Cross. The RVR is the model where the base ES can be front-wheel drive and the system is AWC rather than S-AWC.',
)
rotating(
  'rvr-sel-key',
  'RVR',
  'trims',
  'product',
  'FAST-Key, push-button start and a heated steering wheel on the RVR arrive at:',
  ['ES', 'SE', 'SEL', 'They are not offered'],
  2,
  'SEL AWC, at $31,498, adds the 18-inch wheels, heated power-folding mirrors, roof rails, microsuede, push-button start, FAST-Key and the heated wheel. SE has the leather-wrapped wheel, not the heated one.',
)

core(
  'skill-two-things',
  'Lineup',
  'skill',
  'benefit',
  'You just learned they commute, carry one child and park outside. Which pair do you present on an Outlander SE?',
  [
    'Aluminum pedals and the Noir badge',
    'Heated steering wheel and the hands-free liftgate, tied to the cold start and the child on the hip',
    'The full safety acronym list',
    'Third-row hip room measurements from memory',
  ],
  1,
  'SE is exactly the trim where the heated wheel and the hands-free liftgate show up. Tie each to the life they described. Save the acronyms for the question they actually ask.',
)

export function buildQuestions() {
  if (questions.length < 150) {
    throw new Error(`Only built ${questions.length} questions`)
  }
  return questions
}
