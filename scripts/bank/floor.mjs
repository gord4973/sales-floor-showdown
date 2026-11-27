function choice(text, quality, skill, reply, extra = {}) {
  const delta = { best: [16, 8], ok: [6, 1], poor: [-14, -12] }[quality]
  return { text, quality, skill, reply, trust: delta[0], mood: delta[1], ...extra }
}

function scenario(partial) {
  if (!partial.beats || partial.beats.length < 4) throw new Error(`Short scenario ${partial.id}`)
  for (const beat of partial.beats) {
    if (!beat.choices || beat.choices.length < 3) throw new Error(`Beat short ${partial.id}`)
  }
  return {
    mood: 56,
    trust: 24,
    rev: 1,
    ...partial,
  }
}

export const scenarios = [
  scenario({
    id: 'priya-first',
    title: 'First car, first visit',
    tag: 'First-time buyer',
    customer: 'Priya',
    role: 'New grad, parents helping with the down payment',
    budget: 32000,
    looking: 'Small SUV',
    recommend: '2026 RVR ES AWC, or Eclipse Cross ES if she wants the turbo',
    hidden: 'Her parents told her to buy a Corolla because "it holds its value".',
    accent: '#3dfff2',
    beats: [
      {
        say: "Hi. I'm just looking. I've never bought a car before.",
        choices: [
          choice('Welcome in, Priya. What do you need the car to do, and who else is part of this?', 'best', 'discovery', 'My parents are helping with the down payment. They have opinions.'),
          choice('The RVR is on special. Want to start there?', 'ok', 'product', 'Maybe. I don\'t really know what the differences are.'),
          choice('You look like an Eclipse Cross person. Come sit down.', 'poor', 'trust', 'I... okay. I guess.'),
        ],
      },
      {
        say: 'I drive to work in Vancouver most days. Just me. Sometimes my sister.',
        choices: [
          choice('How many kilometres on a normal day, and do you park outside at home?', 'best', 'discovery', 'About forty. Outside, at my parents\' place in Port Coquitlam.'),
          choice('Then you want all-wheel drive and a sunroof. Let me show you a loaded one.', 'poor', 'product', 'That sounds expensive. I had a number in my head.'),
          choice('A five-seat SUV can do that. We will check the payment against the help your parents are giving.', 'ok', 'finance', 'They said around eight thousand down. I don\'t want the payment to scare them.'),
        ],
      },
      {
        say: 'They told me to just get a Corolla. They said it holds its value and Mitsubishi doesn\'t.',
        choices: [
          choice('They might be right about resale. I won\'t promise a number three years out. Let\'s put warranty, winter driving and today\'s payment beside a Corolla quote.', 'best', 'competitor', 'Okay. That\'s fairer than I expected.'),
          choice('Resale is a myth. Ignore them.', 'poor', 'trust', 'They\'re paying. I\'m not going to ignore them.'),
          choice('Our 10-year powertrain is longer than Toyota\'s 5-year coverage. Want to see the line in the booklet?', 'ok', 'product', 'If I can show them that on paper, maybe.'),
        ],
      },
      {
        say: 'If I brought them, what would we even sit in? I don\'t want to waste their Saturday.',
        choices: [
          choice('One car. RVR ES AWC: heated seats, a price that respects the budget, and AWC you can show them in the rain. Eclipse Cross only if you want the turbo more than the lower payment.', 'best', 'benefit', 'The RVR sounds like the one I can defend.'),
          choice('We\'ll look at all six trims so they feel thorough.', 'poor', 'discovery', 'They will hate that. My dad gets impatient.'),
          choice('Sit in the Outlander GT. Parents like leather.', 'poor', 'finance', 'That payment would end the conversation.'),
        ],
      },
      {
        say: 'So... what happens now?',
        choices: [
          choice('If the RVR ES AWC on the lot fits the payment with their down payment, we write it up subject to them seeing it tonight. What time do they get home?', 'best', 'close', 'They\'re home at six. I can bring them.'),
          choice('Take a brochure and think about the whole lineup.', 'poor', 'close', 'Yeah. I\'ll... think about it.'),
          choice('I can hold the car if you leave a deposit your parents don\'t know about.', 'poor', 'trust', 'No. I\'m not doing that to them.', { trust: -20 }),
        ],
      },
    ],
  }),
  scenario({
    id: 'doug-trade',
    title: 'The trade is his baby',
    tag: 'Trade-in skeptic',
    customer: 'Doug',
    role: 'Owns a 2018 RAV4 he serviced on time',
    budget: 45000,
    looking: 'Outlander',
    recommend: '2026 Outlander SE or LE, after a real appraisal',
    hidden: 'He thinks the store will lowball the RAV4 to steal the deal.',
    accent: '#ffc14d',
    mood: 42,
    trust: 18,
    beats: [
      {
        say: 'I\'m looking. And before you ask, I already know what my RAV4 is worth.',
        choices: [
          choice('Good. Tell me the number you need this deal to hit, and we\'ll appraise it properly instead of guessing in the aisle.', 'best', 'trade', 'I was offered twenty-one at the Toyota store. I don\'t trust that either.'),
          choice('Trades are a hassle. You\'ll get more privately.', 'poor', 'trade', 'So you don\'t want my business.'),
          choice('We always beat Toyota by a thousand. Done.', 'poor', 'trust', 'You haven\'t even looked at it.', { fatal: true, trust: -24 }),
        ],
      },
      {
        say: 'It has every service record. I don\'t want someone kicking the tires and shrugging.',
        choices: [
          choice('Records help. We\'ll do a real walkaround: tires, panels, the service book. I won\'t insult a car you maintained.', 'best', 'trust', 'Alright. It\'s the grey one by the door.'),
          choice('Condition barely matters. It\'s all auction anyway.', 'poor', 'trade', 'Then why would I bother washing it?'),
          choice('I\'ll have the manager glance at it later.', 'ok', 'trade', 'Later usually means a worse number.'),
        ],
      },
      {
        say: 'Be straight. Are you going to lowball me to make the Outlander look cheap?',
        choices: [
          choice('The trade is one number and the Outlander is another. We won\'t bury a weak appraisal inside a discount. You\'ll see both.', 'best', 'trade', 'That\'s the first straight sentence today.'),
          choice('Everyone feels lowballed. Get used to it.', 'poor', 'trust', 'I\'m done.'),
          choice('If the number is light we can add it back as a discount so the payment looks the same.', 'poor', 'finance', 'That\'s the same trick.', { trust: -8 }),
        ],
      },
      {
        say: 'Fine. Why an Outlander instead of another RAV4?',
        choices: [
          choice('Seven seats when the grandkids are here, S-AWC standard, and a 10-year powertrain. Their hybrid will win on fuel. I won\'t pretend otherwise.', 'best', 'competitor', 'The grandkids are the reason I\'m even here.'),
          choice('Because Toyota is overpriced and boring.', 'poor', 'competitor', 'I\'ve liked that RAV4 for six years. Watch it.'),
          choice('The Outlander is nicer. You\'ll see.', 'ok', 'benefit', 'Show me, then.'),
        ],
      },
      {
        say: 'If the appraisal is close to that other offer, I\'ll listen.',
        choices: [
          choice('Let\'s appraise it now and pick SE or LE based on the camera and the cruise, not on a fantasy number. If we can\'t land, I\'ll tell you.', 'best', 'close', 'Do the appraisal. I\'ll wait.'),
          choice('Sign the worksheet and we\'ll adjust the trade after.', 'poor', 'trust', 'No chance.'),
          choice('Come back tomorrow and ask for the used-car manager.', 'ok', 'close', 'I have time now. Tomorrow I won\'t.'),
        ],
      },
    ],
  }),
  scenario({
    id: 'lena-phev',
    title: 'The condo commuter',
    tag: 'PHEV curious',
    customer: 'Lena',
    role: 'Port Coquitlam to downtown, most weekdays',
    budget: 55000,
    looking: 'Outlander PHEV',
    recommend: '2026 Outlander PHEV ES or SE, after a charging plan',
    hidden: 'She lives in a condo and does not have a charger yet.',
    accent: '#7aa2ff',
    beats: [
      {
        say: 'I keep seeing the plug-in. I don\'t want a science project.',
        choices: [
          choice('It should feel like a normal SUV that can skip the gas station on short days. How far is the drive, door to door?', 'best', 'discovery', 'About forty-five kilometres, round trip. More if I go to the gym.'),
          choice('It\'s basically a full EV. You\'ll never buy gas.', 'poor', 'phev', 'That\'s not what the article said.', { fatal: true }),
          choice('The gas Outlander is simpler. Forget the plug.', 'ok', 'product', 'I didn\'t come in to be talked out of it.'),
        ],
      },
      {
        say: 'Forty-five kilometres. I could do that on electricity, right? It says 72.',
        choices: [
          choice('72 is the NRCan number. Winter and heat will cut it. Some January days the engine will help. Most of your year, that commute fits.', 'best', 'phev', 'Okay. I\'d rather know that now.'),
          choice('72, guaranteed, including January.', 'poor', 'trust', 'I don\'t believe you.', { fatal: true }),
          choice('The 3.2 L/100 km figure means almost no gas, ever.', 'poor', 'phev', 'My brother said that number is a trick.', { fatal: true }),
        ],
      },
      {
        say: 'I park in a condo garage. There\'s no charger with my stall.',
        choices: [
          choice('Then we don\'t pretend a 240-volt charger appears on delivery. A regular 120-volt outlet, if you can use one, is about 16 hours from empty. Who owns the stall, and have you asked the strata?', 'best', 'phev', 'I haven\'t asked. I didn\'t want to look foolish.'),
          choice('Stratas always say yes. We\'ll include a charger.', 'poor', 'trust', 'You can\'t promise my strata.', { fatal: true }),
          choice('You can charge at the mall sometimes. It\'s fine.', 'ok', 'phev', 'That sounds annoying, but maybe.'),
        ],
      },
      {
        say: 'If the strata says no, did I buy the wrong vehicle?',
        choices: [
          choice('Not automatically. It still runs as a hybrid on gas, rated about 8.6 L/100 km, and you can DC quick-charge when it matters. If you will never plug in, the gas Outlander may be the cleaner buy.', 'best', 'trust', 'I like that you\'d actually tell me not to.'),
          choice('You should buy it anyway. The rebate covers the mistake.', 'poor', 'finance', 'I don\'t even know if I qualify.'),
          choice('Plug-ins are only for houses.', 'poor', 'phev', 'Then why am I here?'),
        ],
      },
      {
        say: 'Can we drive it in EV mode around the block?',
        choices: [
          choice('Yes. EV mode, then I\'ll show you Save so you can hold charge for the parkade. If it feels right, we check rebate eligibility before anyone quotes a payment.', 'best', 'close', 'Let\'s drive it.'),
          choice('The test drive is gas only. EV mode confuses people.', 'poor', 'phev', 'That\'s the part I came to feel.'),
          choice('Sign first, drive at delivery.', 'poor', 'close', 'No.'),
        ],
      },
    ],
  }),
  scenario({
    id: 'sam-payment',
    title: 'The payment ceiling',
    tag: 'Payment-focused family',
    customer: 'Sam',
    role: 'Two kids in car seats, a number they will not cross',
    budget: 620,
    looking: 'Outlander, payment near $620 a month',
    recommend: '2026 Outlander SE, with the term and down payment shown honestly',
    hidden: 'The $620 ceiling is after tax and includes the winter tires they haven\'t mentioned yet.',
    accent: '#ff7ad9',
    beats: [
      {
        say: 'We need a family SUV. The payment has to stay near six-twenty. That\'s the whole conversation.',
        choices: [
          choice('Six-twenty all-in, or before taxes and extras? And do both kids ride at the same time every day?', 'best', 'finance', 'All-in. And yes, both seats, every day. Sometimes my mother.'),
          choice('Payments are easy. We\'ll stretch the term.', 'poor', 'finance', 'I don\'t want to still be paying when they\'re in high school.'),
          choice('Let me show you the GT. You can always come down.', 'poor', 'product', 'I just told you the number.'),
        ],
      },
      {
        say: 'My mother comes on Sundays. The kids are in seats all week. I also have a stroller and a dog.',
        choices: [
          choice('That is an Outlander, not an Eclipse Cross. Third row for your mother on Sunday, folded the rest of the week so the stroller fits. Cargo behind the third row is only about 308 litres.', 'best', 'benefit', 'Good. The last salesperson pretended the back was huge.'),
          choice('Seven seats means lots of cargo too. You\'ll be fine with everything in it.', 'poor', 'trust', 'That can\'t be true.', { fatal: true }),
          choice('A five-seat with a roof box is the same thing.', 'ok', 'product', 'I don\'t want a roof box in the parkade.'),
        ],
      },
      {
        say: 'Every quote I\'ve had jumps when they add taxes and tires.',
        choices: [
          choice('Then those go in the first pencil. Taxes, freight, PDI, and winter tires as a line you can say yes or no to. I won\'t land a payment that can\'t survive the office.', 'best', 'finance', 'Please. I\'m tired of the second number.'),
          choice('Ignore the first quotes. Ours will be different, trust me.', 'poor', 'trust', 'That\'s what they all say.'),
          choice('We can roll the tires in and not show them.', 'poor', 'finance', 'I want to see them.', { trust: -10 }),
        ],
      },
      {
        say: 'SE or LE? The LE payment might break us.',
        choices: [
          choice('SE has the heated wheel, the liftgate and the sunroof. LE adds the 360 camera and adaptive cruise. If the camera saves a bumper in your parkade, we price it. If not, SE is the honest fit.', 'best', 'benefit', 'The parkade is tight. Price the LE. I\'ll decide with the real number.'),
          choice('Always buy the higher trim. You\'ll regret SE.', 'poor', 'trust', 'You don\'t know my budget better than I do.'),
          choice('They\'re basically identical.', 'ok', 'product', 'Then why is the price different?'),
        ],
      },
      {
        say: 'If the all-in number is under six-fifty I can probably move. Six-twenty was the dream.',
        choices: [
          choice('I\'ll have the desk build SE and LE, all-in, same down payment, tires shown. You pick with both numbers in front of you. No surprise in the office.', 'best', 'close', 'Build them. We\'ll sit down.'),
          choice('Let\'s do 96 months so six-twenty works, and we\'ll talk total later.', 'poor', 'finance', 'That\'s how my brother got stuck.'),
          choice('I\'ll text you a payment tonight.', 'ok', 'close', 'Text me both, but I\'d rather see them now.'),
        ],
      },
    ],
  }),
  scenario({
    id: 'chris-snow',
    title: 'Cypress on a Friday',
    tag: 'Winter driver',
    customer: 'Chris',
    role: 'Loves a snow day, currently in a CR-V',
    budget: 48000,
    looking: 'Outlander',
    recommend: '2026 Outlander SE or GT if the driver aids matter on Highway 1',
    hidden: 'He thinks all-wheel drive is all the same and winter tires are optional if the badge says AWD.',
    accent: '#9af6ff',
    beats: [
      {
        say: 'I go to Cypress when it snows. My CR-V has been fine. Convince me.',
        choices: [
          choice('I won\'t knock the CR-V. When you\'re in snow, do you want a mode you can select, and do you ever take more than four people?', 'best', 'discovery', 'Four of us, sometimes five if a friend bails on their own car. I just leave it in AWD and go.'),
          choice('CR-Vs are dangerous in the mountains.', 'poor', 'competitor', 'I\'ve done three seasons in it. Come on.'),
          choice('S-AWC is unbeatable. Nothing else gets up that road.', 'poor', 'trust', 'That\'s an ad.'),
        ],
      },
      {
        say: 'AWD is AWD. You\'re going to tell me yours is magic.',
        choices: [
          choice('Not magic. On the Outlander you can pick Snow or Gravel. It is still a tire that finds the grip. S-AWC does not replace winters.', 'best', 'benefit', 'Huh. The last person told me I could skip winters.'),
          choice('You can skip winter tires with S-AWC.', 'poor', 'trust', 'Yeah, no.', { fatal: true }),
          choice('Our AWD is full-time lock, all four wheels, always.', 'poor', 'product', 'I don\'t think that\'s true.', { fatal: true }),
        ],
      },
      {
        say: 'The CR-V hybrid also burns less fuel. My partner already looked it up.',
        choices: [
          choice('They\'re right. I won\'t argue the pump. The Outlander case is seven seats if that fifth friend becomes a habit, the warranty, and the modes. Or a PHEV if the weekday commute is the actual fuel problem.', 'best', 'competitor', 'The fifth person happens more than I admit.'),
          choice('Our fuel economy is better than a hybrid. Their site is wrong.', 'poor', 'competitor', 'I\'m looking at the number right now.', { fatal: true }),
          choice('Fuel doesn\'t matter if the car is fun.', 'ok', 'benefit', 'It matters to my partner.'),
        ],
      },
      {
        say: 'Warranty. Theirs is fine, isn\'t it?',
        choices: [
          choice('Honda\'s powertrain coverage in Canada is 5 years / 100,000 km. Ours is 10 years / 160,000 km. Basic vehicle coverage is a different number. I\'ll show you both lines.', 'best', 'product', 'Put it on the sheet. They\'ll ask.'),
          choice('We have a lifetime warranty.', 'poor', 'trust', 'No you don\'t.', { fatal: true }),
          choice('Warranties are all the same.', 'poor', 'product', 'Then I might as well stay.'),
        ],
      },
      {
        say: 'It\'s dry today. How do I even feel the difference?',
        choices: [
          choice('We won\'t fake a snow demo. We\'ll drive the on-ramp so you feel the turbo, and I\'ll book you into the first wet morning if you want the Snow mode for real. Fair?', 'best', 'close', 'That\'s honest. Let\'s drive the on-ramp.'),
          choice('The brochure has a snow photo. That\'s enough.', 'poor', 'close', 'I came to drive.'),
          choice('You have to buy it to really know.', 'poor', 'trust', 'Absolutely not.'),
        ],
      },
    ],
  }),
  scenario({
    id: 'megan-surrey',
    title: 'The Surrey screenshot',
    tag: 'Price shopper',
    customer: 'Megan',
    role: 'Has an ad on her phone and an hour to burn',
    budget: 40000,
    looking: 'Outlander SE',
    recommend: 'The in-stock SE, if the Surrey quote is not the same car',
    hidden: 'The Surrey number is for a different trim and excludes fees.',
    accent: '#ff5d73',
    mood: 48,
    trust: 20,
    beats: [
      {
        say: 'I can get it cheaper in Surrey. Why am I even standing here?',
        choices: [
          choice('Maybe you can. Can I see the ad so we compare the same year, trim and fees?', 'best', 'objection', 'Fine. It\'s this screenshot. It doesn\'t say the trim in big letters.'),
          choice('Surrey ads are bait. Stay here.', 'poor', 'trust', 'So you want me to ignore a number.'),
          choice('I\'ll beat it by five hundred right now.', 'poor', 'finance', 'You haven\'t seen it.', { fatal: true }),
        ],
      },
      {
        say: 'It says Outlander, a payment, and a bunch of fine print I didn\'t read.',
        choices: [
          choice('The fine print is the deal. We\'ll check trim, kilometres, freight, PDI and whether that car is on the ground.', 'best', 'finance', 'It might be an ES. Mine needs the sunroof. I work outdoors and I want the wheel heated too.'),
          choice('Payments in ads are always the real payment.', 'poor', 'finance', 'Even I don\'t believe that.'),
          choice('If it says Outlander, it\'s the same as this SE.', 'poor', 'product', 'That seems lazy.', { fatal: true }),
        ],
      },
      {
        say: 'I don\'t love driving an hour each way if the cars are the same.',
        choices: [
          choice('If they\'re the same out-the-door, I\'ll ask my manager before you burn the hour. If theirs is an ES and you want the SE sunroof and heated wheel, it isn\'t the same car.', 'best', 'objection', 'I want the SE stuff. I just don\'t want to feel stupid.'),
          choice('You\'d be stupid to drive to Surrey.', 'poor', 'trust', 'Wow.'),
          choice('We never match. Store policy.', 'ok', 'objection', 'Then run the real number at least.'),
        ],
      },
      {
        say: 'What can you actually do without disappearing into an office for twenty minutes?',
        choices: [
          choice('I can spec this SE and list every fee in front of you in five minutes. The yes-or-no on matching is the manager\'s, and I\'ll get it while you look at the car, not after you\'ve waited in a chair.', 'best', 'close', 'Do that.'),
          choice('Nothing. The price is the price.', 'poor', 'objection', 'Then the screenshot wins.'),
          choice('I\'ll text you tonight after I "see what I can do".', 'ok', 'close', 'Tonight I\'ll be in Surrey.'),
        ],
      },
      {
        say: 'If your out-the-door is in the same neighbourhood, I\'ll stop shopping.',
        choices: [
          choice('Then that\'s the deal we ask for. Same equipment, fees showing, and a yes or a no today. If it\'s a no, I\'ll say so.', 'best', 'close', 'Get the number.'),
          choice('Sign this and we\'ll match later if we feel like it.', 'poor', 'trust', 'Not a chance.'),
          choice('Let me show you a Noir instead. The payment can look similar if we stretch it.', 'poor', 'finance', 'That\'s not the car in the ad.'),
        ],
      },
    ],
  }),
  scenario({
    id: 'noah-tech',
    title: 'The screen shopper',
    tag: 'Tech trim',
    customer: 'Noah',
    role: 'Wants the camera, the big screen, the HUD',
    budget: 52000,
    looking: 'Outlander or Tucson',
    recommend: '2026 Outlander GT, because the HUD is the thing he named',
    hidden: 'He will feel tricked if the cheaper trim is missing the HUD he already decided he wants.',
    accent: '#d6b4ff',
    beats: [
      {
        say: 'I care about the tech. Big screen, 360 camera, head-up display. The Tucson advertises all of it.',
        choices: [
          choice('On our gas Outlander those don\'t land on the same trim. Screen is ES, 360 camera is LE, HUD is GT. Which one is the deal-breaker?', 'best', 'product', 'The HUD. I drive a lot at night and I hate looking down.'),
          choice('Every Outlander has the HUD.', 'poor', 'product', 'I was on your site. That\'s not true.', { fatal: true }),
          choice('Tech is all the same. Buy on colour.', 'poor', 'benefit', 'Then I\'ll buy the Tucson.'),
        ],
      },
      {
        say: 'Night driving. Highway 1. I want the speed in the glass.',
        choices: [
          choice('That\'s the 10.8-inch HUD, GT. You also get stop-and-go cruise and the 12-speaker Yamaha. LE will disappoint you the first night.', 'best', 'benefit', 'Then don\'t put me in an LE.'),
          choice('An LE is close enough and nobody notices.', 'poor', 'trust', 'I\'ll notice.'),
          choice('We can add an aftermarket HUD to an ES.', 'poor', 'product', 'I don\'t want a gadget stuck on the dash.', { fatal: true }),
        ],
      },
      {
        say: 'The Tucson Limited might have more toys for the money.',
        choices: [
          choice('It might. Line up HUD, camera, audio and warranty on both worksheets. Hyundai\'s 5-year coverage is real. Our powertrain is 10 years / 160,000 km, and we seat seven if that ever matters.', 'best', 'competitor', 'It\'s just the two of us and a dog. Seats aren\'t the point. Warranty might be.'),
          choice('Hyundai warranties are basically nothing.', 'poor', 'competitor', 'That\'s not what I read.', { fatal: true }),
          choice('Don\'t look at the Tucson. It\'ll only confuse you.', 'poor', 'trust', 'Too late.'),
        ],
      },
      {
        say: 'Dog hair. Leather that survives, and a camera so I don\'t reverse into the bin.',
        choices: [
          choice('Leather-appointed starts at SEL. The camera is already there from LE. GT keeps both and adds the HUD you came for. Let\'s sit in that one and pair your phone.', 'best', 'benefit', 'Pair the phone. If it takes ten minutes I\'m out.'),
          choice('Cloth is better for dogs. Ignore the leather.', 'ok', 'benefit', 'I want it to look decent for clients.'),
          choice('The camera is a toy. Use your mirrors.', 'poor', 'trust', 'It\'s a tight lane. I want the camera.'),
        ],
      },
      {
        say: 'Phone\'s paired. This is the one I pictured.',
        choices: [
          choice('Then we price the GT out-the-door, including the taxes you actually pay, and you tell me if the night-driving feature is worth the step.', 'best', 'close', 'Price it. Don\'t surprise me.'),
          choice('Great, sign here while the feeling lasts.', 'poor', 'close', 'Slow down.'),
          choice('Let me also show you the PHEV, the RVR and a used car.', 'poor', 'discovery', 'You just found the car. Stop.'),
        ],
      },
    ],
  }),
  scenario({
    id: 'ruth-mirage',
    title: 'She wanted a Mirage',
    tag: 'Downsizing',
    customer: 'Ruth',
    role: 'Coming out of a tall truck, wants small and cheap',
    budget: 28000,
    looking: 'Something easy to park',
    recommend: '2026 RVR ES AWC',
    hidden: 'She is worried about hip height getting in, and she was told the Mirage is gone.',
    accent: '#ffd0a8',
    beats: [
      {
        say: 'I wanted a Mirage. My neighbour said you don\'t make them anymore. Is that true?',
        choices: [
          choice('Yes. 2024 was the last model year. I won\'t take an order for one. What did you want it to do?', 'best', 'trust', 'Easy to park. Cheap on fuel. I\'m not hauling anything but groceries and the dog.'),
          choice('We can still order a 2026 Mirage. Same car.', 'poor', 'product', 'Don\'t lie to me. I\'ll check.', { fatal: true }),
          choice('The Mirage was a bad car. You dodged a bullet.', 'poor', 'trust', 'My daughter learned to drive in one. Be decent.'),
        ],
      },
      {
        say: 'My hip hates climbing into the truck. I want to sit, not climb, and I don\'t want to feel every wind on the highway.',
        choices: [
          choice('Then we\'re looking at seat height, not just price. The RVR sits like a small SUV. We\'ll do one get-in on the lot before we talk engines.', 'best', 'discovery', 'Good. If I groan getting in, we\'re done.'),
          choice('The lowest car is always easier. We\'ll find you a sport sedan.', 'poor', 'benefit', 'I didn\'t ask for a sports car.'),
          choice('Any of them will be fine for your hip.', 'ok', 'trust', 'We\'ll see.'),
        ],
      },
      {
        say: 'My son wants me in a Kona. He says the warranty is better and it\'s newer.',
        choices: [
          choice('Hyundai\'s 5-year / 100,000 km coverage is strong. Ours splits into 5-year vehicle and 10-year powertrain. The RVR ES FWD starts at $24,998 and heated seats are standard. AWC is $26,998 if you want it for the rain.', 'best', 'competitor', 'I drive to my sister\'s in the rain more than I drive in snow.'),
          choice('Tell your son Hyundai is unreliable.', 'poor', 'competitor', 'He did the research. Don\'t insult him.'),
          choice('Warranties are identical, so ignore him.', 'poor', 'product', 'They aren\'t, though.'),
        ],
      },
      {
        say: 'I still miss the Mirage fuel number. It was tiny.',
        choices: [
          choice('6.2 combined was real, and that car is gone. A RVR ES FWD is rated 8.8 combined. I won\'t dress that up. If fuel is the whole point and you can plug in, we should also look at how you drive before anyone says PHEV.', 'best', 'trust', 'I park in a carport with an outlet. I hadn\'t thought about a plug-in. It might be more car than I want.'),
          choice('The RVR uses the same fuel as a Mirage.', 'poor', 'product', 'Now you\'re fibbing.', { fatal: true }),
          choice('Fuel ratings don\'t matter for someone your age.', 'poor', 'trust', 'Excuse me?'),
        ],
      },
      {
        say: 'Let me try getting into the RVR. If the hip is happy, I\'ll listen to the payment.',
        choices: [
          choice('We\'ll do the get-in first, no speech. If it works, the desk will price ES AWC out-the-door. If it hurts, we stop.', 'best', 'close', 'That\'s respectful. Let\'s try.'),
          choice('Sit in the Outlander GT while I find a brochure.', 'poor', 'discovery', 'That\'s the truck problem all over again.'),
          choice('You have to drive it to know. Hop in and we\'ll hit the highway.', 'ok', 'close', 'Get-in first. Then I\'ll decide.'),
        ],
      },
    ],
  }),
  scenario({
    id: 'amir-work',
    title: 'The work vehicle',
    tag: 'Small business',
    customer: 'Amir',
    role: 'Visits job sites and clients, writes the vehicle off with his accountant',
    budget: 42000,
    looking: 'Eclipse Cross or Rogue',
    recommend: '2026 Eclipse Cross SE or GT, after kilometres are known',
    hidden: 'He wants you to give tax advice you are not qualified to give.',
    accent: '#b8ff7a',
    beats: [
      {
        say: 'I need something I can put clients in and also throw samples in the back. My accountant said lease it.',
        choices: [
          choice('I\'m not your accountant, so the lease-versus-finance call stays with them. I can ask how many kilometres a year and whether clients need the back seat every day.', 'best', 'finance', 'About twenty-five thousand kilometres. Clients a few times a week. Samples are bins, not pallets.'),
          choice('Leasing is always the right write-off. Do that.', 'poor', 'finance', 'You\'re not my accountant.', { fatal: true }),
          choice('Buy the most expensive one. It writes off better.', 'poor', 'trust', 'That\'s not how this works.'),
        ],
      },
      {
        say: 'The Rogue feels more "known". I don\'t want a client googling the badge in the passenger seat.',
        choices: [
          choice('Some people know Nissan better. The Eclipse Cross answer is standard S-AWC, turbo torque from low revs, and a longer powertrain warranty. The badge argument is theirs. The worksheet can be yours.', 'best', 'competitor', 'Torque matters. Some of my sites are gravel.'),
          choice('Nobody respects a Nissan.', 'poor', 'competitor', 'My biggest client drives one.'),
          choice('Badges don\'t matter to clients.', 'ok', 'trust', 'You\'d be surprised.'),
        ],
      },
      {
        say: 'Gravel lots. Rain. I don\'t need a jeep. I need it to leave the lot without drama.',
        choices: [
          choice('Eclipse Cross S-AWC has a Gravel mode, on every trim. It is not a rock crawler. If the lot is a construction pit, say so now and we talk limits.', 'best', 'benefit', 'It\'s a graded lot, not a trail. Gravel mode is the phrase I wanted.'),
          choice('S-AWC will go anywhere a truck goes.', 'poor', 'trust', 'I\'m not looking for a fairy tale.', { fatal: true }),
          choice('Use the RVR\'s 4WD Lock. Same thing, less money.', 'ok', 'product', 'Maybe. But I wanted the nicer cabin for clients.'),
        ],
      },
      {
        say: 'If I lease, I can\'t come back over on kilometres. I\'ve done that once.',
        choices: [
          choice('Then 25,000 km is the number we hand the desk, not a 16,000 km teaser payment. I\'d rather show you a higher payment than a bill in three years.', 'best', 'finance', 'Good. Show me the real cap.'),
          choice('Go low on the cap. You can buy kilometres later, it\'s cheap.', 'poor', 'finance', 'It was not cheap last time.', { fatal: true }),
          choice('Finance it so kilometres don\'t matter, and ignore your accountant.', 'poor', 'trust', 'I\'m not ignoring them.'),
        ],
      },
      {
        say: 'SE or GT? I want clients comfortable. I don\'t need a spaceship.',
        choices: [
          choice('SE gives you the heated wheel, blind-spot warning and the hands-free liftgate for the bins. GT adds leather, the roof and remote start. We price both with the real kilometre cap.', 'best', 'close', 'Price both. I\'ll call the accountant with the two payments, not with a guess.'),
          choice('GT. Always GT. SE looks cheap.', 'poor', 'benefit', 'You haven\'t seen my books.'),
          choice('Take the Rogue. I can\'t win this.', 'poor', 'close', 'I didn\'t ask you to quit.'),
        ],
      },
    ],
  }),
  scenario({
    id: 'jordan-bank',
    title: 'The bank draft',
    tag: 'Outside financing',
    customer: 'Jordan',
    role: 'Pre-approved, allergic to F&I pitches',
    budget: 58000,
    looking: 'Outlander PHEV GT',
    recommend: 'PHEV GT if the HUD and the commute both matter, financed wherever the math wins',
    hidden: 'Jordan assumes every dealer rate is a trap and will walk if you push products.',
    accent: '#ffd36a',
    mood: 50,
    trust: 30,
    beats: [
      {
        say: 'I\'m already approved at my credit union. I don\'t want a finance-office speech.',
        choices: [
          choice('Then you won\'t get one. We\'ll pick the vehicle first. If you want, we\'ll compare their rate to ours and I\'ll tell you if yours wins.', 'best', 'finance', 'Ours is 5.9 for five years. Beat it or don\'t. Just don\'t play games.'),
          choice('You have to finance here. That\'s the only way this works.', 'poor', 'finance', 'Then it doesn\'t work.', { fatal: true }),
          choice('Outside banks slow the delivery down on purpose.', 'poor', 'trust', 'That\'s a tactic.'),
        ],
      },
      {
        say: 'I want the PHEV GT. HUD, the sound system, the works. And I want the rebate.',
        choices: [
          choice('GT is the HUD and the 12-speaker system. The rebate is not mine to gift. We confirm the current program and whether you qualify before it touches the quote.', 'best', 'phev', 'Good. Don\'t dangle it if it isn\'t real.'),
          choice('Every PHEV gets $2,500 off today. I\'ll write it in.', 'poor', 'finance', 'I\'m going to check that tonight and I\'ll be angry if it\'s wrong.', { fatal: true }),
          choice('Rebates are gone forever. Pay the full thing.', 'ok', 'finance', 'The website still mentions one. Check.'),
        ],
      },
      {
        say: 'I also don\'t want rust modules, etch, or a warranty speech.',
        choices: [
          choice('Optional means optional. I\'ll tell you what the vehicle warranty already is, 5-year vehicle and 10-year powertrain and battery, and anything else waits for you to ask.', 'best', 'trust', 'That\'s the first time someone has said optional and meant it.'),
          choice('You need the extended plan. The battery is a time bomb.', 'poor', 'phev', 'Now I don\'t trust the car.', { fatal: true }),
          choice('We\'ll add them and you can cancel. It\'s easier.', 'poor', 'finance', 'No.'),
        ],
      },
      {
        say: 'My rate is 5.9. Be honest if you can\'t touch it.',
        choices: [
          choice('I don\'t know today\'s reserve or special rate. The desk will. If 5.9 wins, we use your credit union and move on.', 'best', 'finance', 'Alright. Ask them.'),
          choice('We can always beat a bank. It\'s what we do.', 'poor', 'trust', 'There it is.', { fatal: true }),
          choice('5.9 is terrible. You should be embarrassed.', 'poor', 'trust', 'We\'re done talking about my finances.'),
        ],
      },
      {
        say: 'If the GT is in stock and the numbers come back clean, I\'ll take it this week.',
        choices: [
          choice('Let\'s confirm the stock unit, the colour, and a delivery time that doesn\'t depend on a product you don\'t want. Then the desk brings one page: price, rate comparison, rebate status.', 'best', 'close', 'One page. I\'ll read it.'),
          choice('Give me your credit application anyway, just in case.', 'poor', 'finance', 'You said you wouldn\'t do that.'),
          choice('Come back Saturday and start over with another rep.', 'ok', 'close', 'I\'m here now.'),
        ],
      },
    ],
  }),
]

export const objections = [
  {
    id: 'surrey-cheaper',
    customer: 'I can get it cheaper in Surrey.',
    context: 'They have a screenshot of an Outlander ad. Trim and fees are unclear.',
    skill: 'objection',
    category: 'price',
    responses: [
      { quality: 'best', text: 'Let me see it. We\'ll match year, trim, kilometres and fees. If their out-the-door is truly lower on the same car, I\'ll take it to my manager before you drive an hour.' },
      { quality: 'ok', text: 'Ads leave things out. I can get our desk to build this exact unit so you have a real number to compare.' },
      { quality: 'poor', text: 'Surrey always lies. You\'d be crazy to go there.' },
      { quality: 'poor', text: 'Fine, I\'ll knock two thousand off right now.' },
    ],
    explanation: 'Isolate the car, then involve the desk. Trash talk and unapproved discounts both lose.',
  },
  {
    id: 'toyota-resale',
    customer: 'Toyota holds its value. Yours won\'t.',
    context: 'A parent is influencing a first-time buyer.',
    skill: 'competitor',
    category: 'competitor',
    responses: [
      { quality: 'best', text: 'They might. I won\'t promise a residual. Let\'s put the 10-year powertrain, the equipment you\'ll use, and today\'s payment next to a real Toyota quote.' },
      { quality: 'ok', text: 'Resale is one line in the ownership math. Warranty is the line I can show you in writing today.' },
      { quality: 'poor', text: 'Resale is a myth dealers invented. Ignore your parents.' },
      { quality: 'poor', text: 'I guarantee this will be worth more than a RAV4 in three years.' },
    ],
    explanation: 'Never guarantee a future auction price. Compare what you can prove.',
  },
  {
    id: 'hate-cvt',
    customer: 'I hate CVTs. They all blow up.',
    context: 'They had a bad experience in another brand.',
    skill: 'objection',
    category: 'product',
    responses: [
      { quality: 'best', text: 'This one is a CVT. I won\'t pretend it\'s an 8-speed. Drive it, and look at the 10-year powertrain coverage before you decide the gearbox is a deal-breaker.' },
      { quality: 'ok', text: 'The reputation comes from somewhere. The way we answer it is the warranty and a drive, not a speech.' },
      { quality: 'poor', text: 'Ours is actually a regular automatic. The CVT thing is just branding.' },
      { quality: 'poor', text: 'CVTs never fail. The warranty is just marketing.' },
    ],
    explanation: 'The lineup uses CVTs. Lying about that is worse than the objection.',
  },
  {
    id: 'third-row-useless',
    customer: 'Third rows are useless. It\'s a gimmick.',
    context: 'They are comparing a five-seat CR-V.',
    skill: 'trust',
    category: 'product',
    responses: [
      { quality: 'best', text: 'For adults on a long trip, I agree. Legroom back there is about 18.7 inches. It\'s for kids and short hops, and you fold it when you need the 866 litres.' },
      { quality: 'ok', text: 'It\'s a sometimes seat. If you never carry more than four, we should make sure you actually want it.' },
      { quality: 'poor', text: 'It\'s as roomy as a minivan. You\'ll thank me on the way to Whistler.' },
      { quality: 'poor', text: 'Then look at a sedan. SUVs are a waste.' },
    ],
    explanation: 'Honest third-row talk is what keeps the vehicle from coming back.',
  },
  {
    id: 'battery-cost',
    customer: 'The PHEV battery will die and cost me a fortune.',
    context: 'They like the commute math and fear the pack.',
    skill: 'phev',
    category: 'phev',
    responses: [
      { quality: 'best', text: 'The pack is warrantied 10 years or 160,000 km. That is not a promise of zero wear. It is the reason a dead pack is not a surprise invoice in year six.' },
      { quality: 'ok', text: 'Ask me what the warranty actually covers before you price a nightmare. I\'ll show you the battery line.' },
      { quality: 'poor', text: 'Batteries never degrade if you plug in every night.' },
      { quality: 'poor', text: 'If it dies you\'re on your own. That\'s the risk of new tech.' },
    ],
    explanation: 'Quote the 10/160 battery warranty and do not promise zero degradation.',
  },
  {
    id: 'no-charger',
    customer: 'I don\'t have a charger at home.',
    context: 'Condo shopper, interested in the PHEV.',
    skill: 'phev',
    category: 'phev',
    responses: [
      { quality: 'best', text: 'Then we find out if you can use a normal 120-volt outlet, and we don\'t pretend a 240-volt unit is included. If you will never plug in, the gas Outlander may be the better buy.' },
      { quality: 'ok', text: 'A lot of the benefit needs a plug. Where does the car sleep?' },
      { quality: 'poor', text: 'You can run a cord from a window. Stratas never care.' },
      { quality: 'poor', text: 'You don\'t need to plug it in. The range is the same either way.' },
    ],
    explanation: 'Charging access decides the PHEV. Do not invent a strata approval.',
  },
  {
    id: 'honda-reliable',
    customer: 'Honda is more reliable. Everyone knows that.',
    context: 'CR-V owner, arms folded.',
    skill: 'competitor',
    category: 'competitor',
    responses: [
      { quality: 'best', text: 'Honda earns that reputation. I won\'t debate a feeling. I can show you seven seats, S-AWC and a longer powertrain warranty, and you can tell me if any of that matters more.' },
      { quality: 'ok', text: 'Reliability is a fair thing to want. The warranty is how we put a number on ours.' },
      { quality: 'poor', text: 'Honda is coasting on the nineties. They\'re junk now.' },
      { quality: 'poor', text: 'Reliability stats say we win. I read it somewhere.' },
    ],
    explanation: 'Respect the reputation. Move to seats, system and warranty.',
  },
  {
    id: 'bank-rate',
    customer: 'Your rate is worse than my bank.',
    context: 'They have a pre-approval and expect a trap.',
    skill: 'finance',
    category: 'finance',
    responses: [
      { quality: 'best', text: 'Tell me the rate and the term. If your bank wins, we use it. The car decision doesn\'t depend on trapping the loan.' },
      { quality: 'ok', text: 'Let the desk compare them on one page before you decide we\'re automatically higher.' },
      { quality: 'poor', text: 'Banks are always worse once you read the real conditions. Just finance here.' },
      { quality: 'poor', text: 'I can mark the rate down myself. What do you want it to be?' },
    ],
    explanation: 'A clean rate comparison builds trust. You do not freelance the rate.',
  },
  {
    id: 'think-about-it',
    customer: 'I need to think about it.',
    context: 'The drive went well. They are drifting to the door.',
    skill: 'close',
    category: 'stall',
    responses: [
      { quality: 'best', text: 'Of course. What\'s the open item: the payment, the partner, the trade, or something on the car? Let\'s name it before you go.' },
      { quality: 'ok', text: 'Take the time. Can we book twenty minutes tomorrow so the thinking has the missing number in it?' },
      { quality: 'poor', text: 'No problem. Here\'s a brochure.' },
      { quality: 'poor', text: 'This exact car will be gone in an hour. Thinking is how you lose it.' },
    ],
    explanation: 'A stall hides one decision. Isolate it. Fake scarcity burns trust.',
  },
  {
    id: 'email-quote',
    customer: 'Just email me a quote.',
    context: 'They won\'t sit down.',
    skill: 'close',
    category: 'stall',
    responses: [
      { quality: 'best', text: 'I will. Tell me the trim and what has to be in the number, taxes included. Then let\'s put a time on the calendar to read it together so it doesn\'t become a screenshot with no context.' },
      { quality: 'ok', text: 'I can email the MSRP tonight, clearly marked as not out-the-door, and follow up tomorrow.' },
      { quality: 'poor', text: 'Sure. I\'ll send three payments with no term and no down payment.' },
      { quality: 'poor', text: 'We don\'t email prices.' },
    ],
    explanation: 'An unanchored email becomes someone else\'s objection. Label it and book the review.',
  },
  {
    id: 'payment-high',
    customer: 'That payment is too high.',
    context: 'First pencil is $70 over their ceiling.',
    skill: 'finance',
    category: 'finance',
    responses: [
      { quality: 'best', text: 'Which lever can you move: down payment, term, or trim? I\'ll show the total cost of each so a lower payment doesn\'t quietly cost more.' },
      { quality: 'ok', text: 'Let\'s see what a longer term does, and I\'ll tell you what it adds in interest before you pick it.' },
      { quality: 'poor', text: 'We\'ll do 96 months and not talk about the total.' },
      { quality: 'poor', text: 'Then you can\'t afford the car. Sorry.' },
    ],
    explanation: 'Payment is a structure. Show the total, not just the monthly.',
  },
  {
    id: 'upside-down',
    customer: 'I owe more than my trade is worth.',
    context: 'They know, and they are embarrassed.',
    skill: 'trade',
    category: 'trade',
    responses: [
      { quality: 'best', text: 'We\'ll put the shortfall on the page. You can roll some, write a cheque, or do both. I won\'t hide it inside the payment.' },
      { quality: 'ok', text: 'It happens. The appraiser still needs to see the car before anyone talks about how much is buried.' },
      { quality: 'poor', text: 'Negative equity disappears if we pick the right term.' },
      { quality: 'poor', text: 'We don\'t deal with upside-down trades. Sell it yourself.' },
    ],
    explanation: 'Name the shortfall. Hiding it creates the next upside-down loan.',
  },
  {
    id: 'leaving-canada',
    customer: 'I heard Mitsubishi is leaving Canada.',
    context: 'A rumour from a group chat.',
    skill: 'trust',
    category: 'brand',
    responses: [
      { quality: 'best', text: 'The rumour recycles. Mitsubishi Motor Sales of Canada is launching current product, including the 2026 lineup you\'re sitting in, through its dealer network. Warranty claims don\'t depend on a Facebook thread.' },
      { quality: 'ok', text: 'I hear that one a lot. Look at what\'s on the ground this model year, and at the warranty terms in the booklet, not at a repost.' },
      { quality: 'poor', text: 'They might be. I\'d buy the extended warranty just in case.' },
      { quality: 'poor', text: 'If they leave, your warranty is worthless, so decide fast.' },
    ],
    explanation: 'Do not feed the rumour or use it to scare-sell a product.',
  },
  {
    id: 'brand-shrinking',
    customer: 'The Mirage is gone. The brand is shrinking.',
    context: 'They wanted a cheap new car.',
    skill: 'product',
    category: 'brand',
    responses: [
      { quality: 'best', text: 'The Mirage ended after 2024. That\'s a model, not the store. The current lineup is RVR, Eclipse Cross, Outlander and Outlander PHEV. Which job were you hiring the Mirage to do?' },
      { quality: 'ok', text: 'City cars got hard to build at that price. Tell me the payment and the parking spot and we\'ll pick from what we can actually order.' },
      { quality: 'poor', text: 'We can still order a Mirage. The website is behind.' },
      { quality: 'poor', text: 'Good riddance. It was embarrassing.' },
    ],
    explanation: 'Acknowledge the end of the Mirage and pivot to a real 2026 job.',
  },
  {
    id: 'rav4-fuel',
    customer: 'The RAV4 Hybrid sips fuel. You can\'t touch it.',
    context: 'They have the NRCan tab open.',
    skill: 'competitor',
    category: 'competitor',
    responses: [
      { quality: 'best', text: 'You\'re right. I won\'t fight that number. Do you ever need a third row, or a plug-in commute the hybrid can\'t do?' },
      { quality: 'ok', text: 'The hybrid wins on pump litres. Our case has to be something else, or you should buy the Toyota.' },
      { quality: 'poor', text: 'Our 8.7 combined is basically the same.' },
      { quality: 'poor', text: 'Hybrids are a fad. Gas is simpler and cheaper to run.' },
    ],
    explanation: 'Agree, then move to seats or the PHEV. Never call 8.7 a tie.',
  },
  {
    id: 'awd-is-awd',
    customer: 'AWD is AWD. Yours is just marketing.',
    context: 'They drive to the mountains a few times a winter.',
    skill: 'benefit',
    category: 'product',
    responses: [
      { quality: 'best', text: 'They aren\'t identical. I can show you the Snow and Gravel modes, and I\'ll still tell you to buy winter tires. Want to feel the button, or is the tire the real question?' },
      { quality: 'ok', text: 'Fair challenge. The useful version is a mode you select on purpose, not a slogan.' },
      { quality: 'poor', text: 'S-AWC locks every wheel all the time. It\'s unstoppable.' },
      { quality: 'poor', text: 'You\'re right, it\'s all marketing. Buy on colour.' },
    ],
    explanation: 'Explain selectable modes and do not skip winter tires.',
  },
  {
    id: 'wait-2027',
    customer: 'I\'ll wait for the next model year.',
    context: 'They like the 2026 in front of them.',
    skill: 'close',
    category: 'stall',
    responses: [
      { quality: 'best', text: 'What do you want that this one doesn\'t do? The warranty starts when you drive it home. A future model doesn\'t carry the kids in the meantime.' },
      { quality: 'ok', text: 'You can wait. If the reason is a feature, let\'s see if it\'s already here before you lose a year.' },
      { quality: 'poor', text: 'The next one will be worse. Buy now.' },
      { quality: 'poor', text: 'The redesign will be cheaper. I\'d wait if I were you.' },
    ],
    explanation: 'Find the missing feature. Do not badmouth your own stock or invent the next price.',
  },
  {
    id: 'spouse',
    customer: 'My spouse has to see it.',
    context: 'Real second decision-maker, not a brush-off. Could be either.',
    skill: 'close',
    category: 'stall',
    responses: [
      { quality: 'best', text: 'Good. What time are you both free? I\'ll send the exact stock card so the conversation at home matches what we just drove.' },
      { quality: 'ok', text: 'Bring them. Evenings work, and I\'ll hold the notes from today so you don\'t have to repeat yourself.' },
      { quality: 'poor', text: 'Spouses always say no. Decide while you\'re here.' },
      { quality: 'poor', text: 'Sign now and they can see it at delivery.' },
    ],
    explanation: 'Get both buyers in the vehicle. Do not trick the absent one.',
  },
  {
    id: 'internet-price',
    customer: 'The internet price is lower than what you just said.',
    context: 'They are comparing MSRP to an out-the-door figure.',
    skill: 'trust',
    category: 'price',
    responses: [
      { quality: 'best', text: 'Let\'s line them up. MSRP excludes freight, PDI and taxes. If the other number is out-the-door, we\'ll build ours the same way.' },
      { quality: 'ok', text: 'Send me the link. I want to see whether it\'s the same trim before I explain the gap.' },
      { quality: 'poor', text: 'The internet is wrong. Pay the number on my worksheet.' },
      { quality: 'poor', text: 'MSRP is what you pay to drive away. The rest is optional.' },
    ],
    explanation: 'MSRP is not out-the-door. Build both quotes with the same lines.',
  },
  {
    id: 'sunroof-leak',
    customer: 'Sunroofs leak. I don\'t want one in this rain.',
    context: 'They like the SE otherwise.',
    skill: 'objection',
    category: 'product',
    responses: [
      { quality: 'best', text: 'A neglected drain can leak on any brand. If you don\'t want the roof, ES exists and we won\'t force the glass. If you want the SE equipment, we\'ll show you the drains and the warranty terms.' },
      { quality: 'ok', text: 'I won\'t promise a sunroof can never leak. I can show you an ES if you\'d rather not have one.' },
      { quality: 'poor', text: 'Ours are sealed forever. Impossible for them to leak.' },
      { quality: 'poor', text: 'Then you can\'t have a nice trim. Roofs come with everything.' },
    ],
    explanation: 'ES has no sunroof. Do not claim a roof can never leak.',
  },
  {
    id: 'only-five',
    customer: 'I only need five seats. The third row is wasted money.',
    context: 'They are in an Outlander by habit.',
    skill: 'discovery',
    category: 'product',
    responses: [
      { quality: 'best', text: 'Then don\'t pay for a seat you\'ll fold forever. Eclipse Cross or RVR may fit better. When do you carry more than four?' },
      { quality: 'ok', text: 'You can live with it folded. Let\'s make sure the cargo shape still works for you before we abandon it.' },
      { quality: 'poor', text: 'Everyone ends up needing seven. Just buy it.' },
      { quality: 'poor', text: 'Five-seat Mitsubishi SUVs don\'t exist anymore.' },
    ],
    explanation: 'Switch models if the third row is truly useless to them.',
  },
  {
    id: 'real-hybrid',
    customer: 'I want a real hybrid, not a tiny battery.',
    context: 'They are looking at the gas Outlander and a Tucson Hybrid.',
    skill: 'phev',
    category: 'phev',
    responses: [
      { quality: 'best', text: 'The gas Outlander is a 48-volt mild hybrid. It is not a full hybrid and it does not plug in. If you want electric kilometres, that\'s the PHEV. If you want a Toyota-style hybrid, I\'ll say so and we compare honestly.' },
      { quality: 'ok', text: 'Let me separate the mild hybrid from the plug-in before we go further. They solve different jobs.' },
      { quality: 'poor', text: 'Mild hybrid means you can plug it in on weekends.' },
      { quality: 'poor', text: 'Full hybrids are a scam. Mild is the same thing.' },
    ],
    explanation: 'Never call the 48-volt system a plug-in or a full hybrid.',
  },
  {
    id: 'tucson-toys',
    customer: 'The Tucson has more toys for the money.',
    context: 'They want a feature-count win.',
    skill: 'competitor',
    category: 'competitor',
    responses: [
      { quality: 'best', text: 'Let\'s list the toys you named, on the trims that actually have them, and then warranty and seats. A longer feature list you won\'t use loses to two features you will.' },
      { quality: 'ok', text: 'Feature count isn\'t the same as a fit. Tell me the three you would notice on a night drive.' },
      { quality: 'poor', text: 'We have more features. I don\'t need the list.' },
      { quality: 'poor', text: 'Hyundai loads cars with junk that breaks.' },
    ],
    explanation: 'Compare the features they named, on the right trims.',
  },
  {
    id: 'old-rvr',
    customer: 'I read old RVR reviews. They weren\'t kind.',
    context: 'They are in a 2026 RVR and holding a phone.',
    skill: 'trust',
    category: 'product',
    responses: [
      { quality: 'best', text: 'Some of those reviews are about older powertrains and cabins. This one still isn\'t a luxury car. Tell me which complaint you remember and we\'ll see if it\'s still true on this drive.' },
      { quality: 'ok', text: 'Read them with me. I\'d rather answer a specific complaint than a headline.' },
      { quality: 'poor', text: 'Reviewers don\'t know how to drive.' },
      { quality: 'poor', text: 'That was a different RVR and every problem is fixed. All of them.' },
    ],
    explanation: 'Invite the specific complaint. Do not claim every old issue vanished.',
  },
  {
    id: 'twenty-minutes',
    customer: 'I have twenty minutes. Impress me.',
    context: 'Lunch break, keys still in their hand.',
    skill: 'discovery',
    category: 'process',
    responses: [
      { quality: 'best', text: 'One question: what does the car have to do on a normal Tuesday? I\'ll show you that, and we\'ll book the longer drive if it earns it.' },
      { quality: 'ok', text: 'We can sit in the one that fits a family of your size and pair your phone. The test drive can be tonight.' },
      { quality: 'poor', text: 'Twenty minutes is enough for the whole lineup, the credit app and a write-up.' },
      { quality: 'poor', text: 'Come back when you\'re serious.' },
    ],
    explanation: 'Short visits need one use-case and a next step.',
  },
  {
    id: 'feels-cheap-2016',
    customer: 'I sat in a 2016 Outlander. It felt cheap.',
    context: 'They have not sat in the 2026 yet.',
    skill: 'trust',
    category: 'product',
    responses: [
      { quality: 'best', text: 'A 2016 should feel dated. Sit in this one and tell me what "cheap" meant: the wheel, the screen, the seat, or the noise. We\'ll check that thing, not my opinion.' },
      { quality: 'ok', text: 'Ten years is a long time in a cabin. Give this one a fair sit before you decide it\'s the same car.' },
      { quality: 'poor', text: 'Nothing has changed and that\'s a good thing. Mitsubishi doesn\'t chase trends.' },
      { quality: 'poor', text: '2016 was class-leading. Your memory is off.' },
    ],
    explanation: 'Let the 2026 cabin answer a specific memory.',
  },
  {
    id: 'sell-in-four',
    customer: 'Warranty doesn\'t matter. I sell cars in four years.',
    context: 'They lease or trade quickly.',
    skill: 'benefit',
    category: 'warranty',
    responses: [
      { quality: 'best', text: 'Then the 10-year powertrain matters to the next buyer and to your residual conversation, and the 5-year roadside matters to you. If you truly trade at four, let\'s talk kilometres and a lease cap before a finance term.' },
      { quality: 'ok', text: 'Short ownership changes the pitch. How many kilometres will you put on, and do you want a lease?' },
      { quality: 'poor', text: 'Warranty never matters. Forget I mentioned it.' },
      { quality: 'poor', text: 'You say that now. Everyone keeps cars twelve years.' },
    ],
    explanation: 'Short ownership points at lease kilometres and the next buyer, not a lecture.',
  },
  {
    id: 'want-lease',
    customer: 'I want to lease, not finance.',
    context: 'They commute Port Coquitlam to Vancouver.',
    skill: 'finance',
    category: 'finance',
    responses: [
      { quality: 'best', text: 'Good option if the kilometres fit. How far do you drive in a year? I don\'t want a pretty payment with a cap you\'ll blow by summer.' },
      { quality: 'ok', text: 'We can lease. The desk will need your yearly kilometres and how long you keep cars.' },
      { quality: 'poor', text: 'Leasing is a waste. I\'m going to show you finance only.' },
      { quality: 'poor', text: 'Here\'s a lease at 12,000 km a year. Everyone qualifies for that.' },
    ],
    explanation: 'Ask yearly kilometres before you quote a lease cap.',
  },
  {
    id: 'noir-swirl',
    customer: 'Black paint swirls if you look at it.',
    context: 'They want a Noir and they wash carefully.',
    skill: 'trust',
    category: 'product',
    responses: [
      { quality: 'best', text: 'Black shows wash marks. Noir is the styling, not a harder paint. If you like the look, we talk wash habits. I won\'t throw in a ceramic coat I haven\'t priced.' },
      { quality: 'ok', text: 'If swirls will bother you every Sunday, look at a colour that hides it. I\'d rather lose the Noir than sell you a weekly regret.' },
      { quality: 'poor', text: 'Our black paint cannot swirl. It\'s a special clear.' },
      { quality: 'poor', text: 'We\'ll ceramic it for free. I promise.' },
    ],
    explanation: 'Noir is appearance, not magic paint. Do not gift unpriced protection.',
  },
  {
    id: 'winter-tires',
    customer: 'Throw in winter tires.',
    context: 'They are ready to buy an Outlander and it is November.',
    skill: 'close',
    category: 'price',
    responses: [
      { quality: 'best', text: 'The car comes with all-seasons. S-AWC does not replace winters. I\'ll ask the desk what a tire package costs before I say yes.' },
      { quality: 'ok', text: 'We can price tires as their own line. I don\'t want them hidden so the payment looks cute.' },
      { quality: 'poor', text: 'Done. I\'ll pay for them out of my commission.' },
      { quality: 'poor', text: 'You don\'t need winters with this system.' },
    ],
    explanation: 'Price the tires or do not offer them. S-AWC is not a tire.',
  },
  {
    id: 'doc-fee',
    customer: 'What\'s this documentation fee? It feels like a junk fee.',
    context: 'They are reading the worksheet line by line.',
    skill: 'trust',
    category: 'price',
    responses: [
      { quality: 'best', text: 'It\'s a fee, and you should see it now rather than at the signature. I\'ll tell you what it is in this store and we\'ll leave it on the page with the taxes, not folded into the payment unspoken.' },
      { quality: 'ok', text: 'Ask me about every line. If I can\'t name it, it shouldn\'t be a surprise later.' },
      { quality: 'poor', text: 'Everyone charges it. Stop reading.' },
      { quality: 'poor', text: 'I\'ll delete it and bury it somewhere else so the page looks clean.' },
    ],
    explanation: 'Name the fee. Moving it is not removing it.',
  },
  {
    id: 'phev-winter-range',
    customer: 'My friend\'s plug-in was useless in January.',
    context: 'They still like the PHEV commute story.',
    skill: 'phev',
    category: 'phev',
    responses: [
      { quality: 'best', text: 'Cold cuts electric range. Their friend wasn\'t wrong. On a bad morning the engine helps, which is why this is a plug-in hybrid and not a pure EV. How far is your worst day, not your average?' },
      { quality: 'ok', text: 'January is the test. Let\'s see if your commute still fits when the 72 km becomes less than 72.' },
      { quality: 'poor', text: 'Our battery ignores the cold. 72 km, all winter.' },
      { quality: 'poor', text: 'Then don\'t buy a PHEV. Your friend settled it.' },
    ],
    explanation: 'Agree that winter cuts range. Ask about the worst day.',
  },
  {
    id: 'manager-discount',
    customer: 'Go get your manager. I only deal with the boss.',
    context: 'You have not finished discovery.',
    skill: 'objection',
    category: 'process',
    responses: [
      { quality: 'best', text: 'You can meet them. First I need the trim, the trade and the payment target so the manager walks in with a number, not a handshake.' },
      { quality: 'ok', text: 'I\'ll bring them when we have something to decide. Right now we\'d be introducing you twice.' },
      { quality: 'poor', text: 'They\'re busy. You get me.' },
      { quality: 'poor', text: 'Sure. I\'ll go get a discount before I know which car you want.' },
    ],
    explanation: 'A manager with no facts can only guess. Finish the picture first.',
  },
]

const pitch = (id, name, vehicle, respect, cards) => ({ id, name, vehicle, respect, cards, rev: 1 })

export const competitors = [
  pitch('rav4', 'Toyota RAV4', 'Outlander', 'The RAV4 Hybrid really does use less fuel. Agree before you pivot.', [
    { id: 'seats', title: 'Seven seats', line: 'Every Outlander seats seven. The RAV4 seats five.', good: true, why: 'True, and it is the cleanest contrast in the segment.' },
    { id: 'warranty', title: '10-year powertrain', line: 'Our powertrain warranty is 10 years / 160,000 km. Toyota Canada\'s is 5 years / 100,000 km.', good: true, why: 'Say both numbers. Do not call Toyota\'s warranty fake.' },
    { id: 'sawc', title: 'S-AWC standard', line: 'S-AWC is on every Outlander, with modes you can show them for the rain.', good: true, why: 'Standard beats an AWD conversation that starts with "which package".' },
    { id: 'phev', title: 'Plug-in commute', line: 'If the weekday loop fits, the PHEV can do it on electricity. A RAV4 Hybrid cannot plug in.', good: true, why: 'Only if they can plug in. You already have that from discovery.' },
    { id: 'fuel-trap', title: 'We burn less', line: 'Tell them the gas Outlander beats the RAV4 Hybrid on fuel.', good: false, why: 'It does not. Gas Outlander is 8.7 combined. Do not die on this hill.' },
    { id: 'resale-trap', title: 'Better resale', line: 'Promise the Outlander will be worth more than a RAV4 in three years.', good: false, why: 'You cannot promise the auction. Compare warranty and payment instead.' },
  ]),
  pitch('crv', 'Honda CR-V', 'Outlander', 'The CR-V Hybrid is efficient and Honda\'s reliability reputation is earned. Do not sneer.', [
    { id: 'seats', title: 'Third row', line: 'Seven seats standard versus five in the CR-V.', good: true, why: 'This is why families cross the lot.' },
    { id: 'warranty', title: 'Longer powertrain', line: '10 years / 160,000 km powertrain versus Honda\'s 5 years / 100,000 km.', good: true, why: 'Accurate Canadian comparison if you keep basic coverage separate.' },
    { id: 'sawc', title: 'Modes, not a badge', line: 'Show Snow or Gravel mode instead of saying AWD is AWD.', good: true, why: 'A demonstration beats a slogan.' },
    { id: 'phev', title: 'Real plug', line: 'Offer the PHEV only if their commute and their plug support it.', good: true, why: 'The CR-V hybrid does not plug in. The PHEV does.' },
    { id: 'fuel-trap', title: 'Fuel win', line: 'Claim you use less fuel than the CR-V Hybrid.', good: false, why: 'You will get fact-checked in the parking lot.' },
    { id: 'danger-trap', title: 'Honda is unsafe', line: 'Hint that CR-Vs are a bad idea in the mountains.', good: false, why: 'Insulting a car they already trust ends the conversation.' },
  ]),
  pitch('rogue', 'Nissan Rogue', 'Outlander', 'The Rogue is a known five-seat compact. Their three-row is a different vehicle.', [
    { id: 'seats', title: 'Seven, not five', line: 'Outlander seats seven. The Rogue does not. Don\'t let them blur it with a Pathfinder.', good: true, why: 'Keep the comparison on the vehicle they named.' },
    { id: 'warranty', title: 'Powertrain years', line: '10-year powertrain versus Nissan\'s 5-year / 100,000 km coverage.', good: true, why: 'A clean, checkable contrast.' },
    { id: 'sawc', title: 'Standard S-AWC', line: 'S-AWC is standard here, not a package you hope is on the unit.', good: true, why: 'Package confusion is where Rogue deals get muddy.' },
    { id: 'audio', title: 'Yamaha, say it right', line: 'Play their song on the Yamaha system and stop talking.', good: true, why: 'A ten-second demo beats a feature list.' },
    { id: 'name-trap', title: 'Nobody trusts Nissan', line: 'Tell them the Rogue badge is embarrassing.', good: false, why: 'Their friend or their boss may drive one.' },
    { id: 'cvt-trap', title: 'Ours is not a CVT', line: 'Claim the Outlander gearbox is a regular automatic.', good: false, why: 'It is a CVT. The warranty is the honest answer.' },
  ]),
  pitch('tucson', 'Hyundai Tucson', 'Outlander', 'Hyundai\'s 5-year / 100,000 km coverage is genuinely strong, and they sell hybrids and a plug-in.', [
    { id: 'warranty', title: 'Separate the warranties', line: 'Respect the 5-year comprehensive coverage. Then show the 10-year powertrain.', good: true, why: 'Trashing Hyundai\'s warranty makes you look unread.' },
    { id: 'seats', title: 'Third row they do not have', line: 'A Tucson plug-in is still five seats. Outlander PHEV keeps seven.', good: true, why: 'The family brief is the opening.' },
    { id: 'sawc', title: 'Standard S-AWC', line: 'S-AWC on every Outlander versus an AWD conversation on the Tucson.', good: true, why: 'Make it a demo, not a speech.' },
    { id: 'toys', title: 'Their three features', line: 'Line up only the features they named, on the trims that have them.', good: true, why: 'Feature-count contests reward the louder brochure.' },
    { id: 'only-plug', title: 'Only we plug in', line: 'Say Mitsubishi is the only plug-in in the conversation.', good: false, why: 'Tucson has a plug-in hybrid. You will get caught.' },
    { id: 'junk-trap', title: 'Their toys break', line: 'Call Hyundai equipment junk.', good: false, why: 'Insults are not a comparison.' },
  ]),
  pitch('cx5', 'Mazda CX-5', 'Outlander', 'A lot of people prefer the CX-5\'s steering. Let them have it.', [
    { id: 'seats', title: 'Room for seven', line: 'CX-5 is five seats. Ask if that is actually enough.', good: true, why: 'Space is the factual gap.' },
    { id: 'phev', title: 'A plug they cannot get there', line: 'No CX-5 plug-in. Offer the PHEV only when the commute fits.', good: true, why: 'Do not pitch a PHEV to someone with nowhere to plug in.' },
    { id: 'warranty', title: '10-year powertrain', line: 'Mazda does not match a 10-year / 160,000 km powertrain warranty.', good: true, why: 'Keep the claim on our number, which you can show.' },
    { id: 'sawc', title: 'Weather modes', line: 'Offer a Snow-mode explanation for the trips they actually take.', good: true, why: 'Tied to their driving, this lands. As a slogan, it does not.' },
    { id: 'handle-trap', title: 'We out-handle Mazda', line: 'Claim the Outlander is the driver\'s car versus a CX-5.', good: false, why: 'You will lose the test drive and the trust.' },
    { id: 'snob-trap', title: 'Mazda is for pretenders', line: 'Smile at people who care how a car steers.', good: false, why: 'That is the reason they came in. Respect it.' },
  ]),
  pitch('kona', 'Hyundai Kona', 'RVR', 'Kona can be a gas vehicle or an EV. Ask which one they mean before you pitch.', [
    { id: 'price', title: 'Door price', line: 'RVR ES FWD starts at $24,998 MSRP, before fees. Ask if that is the budget.', good: true, why: 'Price is the RVR\'s honest weapon. Do not blur in fees.' },
    { id: 'heat', title: 'Heated seats on ES', line: 'Heated fronts are standard on the RVR ES. Mention them if they feel the cold.', good: true, why: 'A base-trim benefit, not a step-up you have to apologize for.' },
    { id: 'awc', title: 'Lock mode', line: 'AWC gives 2WD, Auto and 4WD Lock. Explain when Lock is for low-speed slush, not the highway.', good: true, why: 'Teaching the button is the skill.' },
    { id: 'warranty', title: 'Powertrain length', line: '10-year powertrain versus Hyundai\'s 5-year / 100,000 km coverage. Give them the 5-year basic, too.', good: true, why: 'Balanced warranty talk survives a spouse who did the reading.' },
    { id: 'ev-trap', title: 'We are the EV', line: 'Compare an RVR\'s fuel to a Kona Electric as if they are the same kind of car.', good: false, why: 'If they want an EV, the RVR is not one. Say so.' },
    { id: 'third-trap', title: 'Bring the kids\' row', line: 'Talk about Outlander third-row space while standing at a Kona alternative.', good: false, why: 'Wrong vehicle. You sound lost.' },
  ]),
  pitch('hrv', 'Honda HR-V', 'RVR', 'The HR-V is a tidy five-seat Honda. Reliability feelings will come up. Do not flinch.', [
    { id: 'price', title: 'Open at the RVR price', line: 'Start at the RVR ES number and ask what they were quoted on the HR-V, fees included on both.', good: true, why: 'Apples to apples, or not at all.' },
    { id: 'lock', title: '4WD Lock', line: 'Show 4WD Lock for a slushy lot. HR-V AWD does not give them that button.', good: true, why: 'A specific system difference, not "ours is better AWD".' },
    { id: 'heat', title: 'Heat at the base', line: 'Heated seats on the ES. Confirm the HR-V trim they priced before you claim a win.', good: true, why: 'You told them to confirm. That is the skill.' },
    { id: 'step', title: 'Know when to walk', line: 'If they want turbo torque and S-AWC, walk them to the Eclipse Cross instead of stretching the RVR.', good: true, why: 'Changing vehicles is product knowledge.' },
    { id: 'turbo-trap', title: 'RVR is the turbo', line: 'Tell them the RVR ES is a turbo.', good: false, why: 'It is a 2.0L. The turbo is the Eclipse Cross and the gas Outlander.' },
    { id: 'honda-trap', title: 'Honda is unsafe', line: 'Imply Honda safety equipment is a toy.', good: false, why: 'Honda Sensing is real. Do not sneer.' },
  ]),
  pitch('corolla-cross', 'Toyota Corolla Cross', 'Eclipse Cross', 'The hybrid version is thrifty. Toyota resale will be their second sentence.', [
    { id: 'torque', title: 'Low-rpm torque', line: 'Eclipse Cross makes 184 lb-ft from 2,000 rpm. Offer the on-ramp, not a horsepower shout.', good: true, why: 'Let them feel the merge.' },
    { id: 'sawc', title: 'S-AWC on all trims', line: 'Every Eclipse Cross has S-AWC. Say that, then ask if they actually want it.', good: true, why: 'Standard is only a benefit if their driving needs it.' },
    { id: 'warranty', title: '10 versus 5', line: '10-year / 160,000 km powertrain versus Toyota\'s 5-year / 100,000 km.', good: true, why: 'The resale conversation can sit beside a warranty you can point at.' },
    { id: 'price-path', title: 'Have a second car ready', line: 'If the Eclipse Cross payment scares them, the RVR is the price path. Do not force the turbo.', good: true, why: 'A planned step-down beats a lost customer.' },
    { id: 'fuel-trap', title: 'We sip less', line: 'Claim the Eclipse Cross uses less fuel than the Corolla Cross Hybrid.', good: false, why: '9.3 combined will not beat that hybrid. Agree and move.' },
    { id: 'resale-trap', title: 'We win resale', line: 'Promise stronger resale than Toyota.', good: false, why: 'Do not promise the future market.' },
  ]),
]

export const tips = [
  {
    skill: 'product',
    title: 'Know the step, not the speech',
    body: 'Before the next up, pick one trim and name two things that arrive on it and not on the one below. On a 2026 gas Outlander, ES already has S-AWC, seven seats, the 12.3-inch screen and Yamaha audio. The sunroof, wireless charger, heated wheel and hands-free liftgate show up at SE. The 360 camera and adaptive cruise show up at LE. The HUD waits for GT. If you quote a sunroof on an ES, you taught them not to trust you. Open the sticker, point at the line, then be quiet.',
  },
  {
    skill: 'competitor',
    title: 'Agree, then move',
    body: 'The RAV4 Hybrid and the CR-V Hybrid really are thrifty. Hyundai really does have a 5-year / 100,000 km warranty. Say the true thing in one sentence so they stop defending it. Then ask a question you can win honestly: do they need a third row, a plug, a price that starts at the RVR, or a powertrain warranty that runs 10 years / 160,000 km. Never invent a fuel win. Never promise resale.',
  },
  {
    skill: 'discovery',
    title: 'Tuesday picks the car',
    body: 'Ask where the vehicle will be on a normal Tuesday and who is in it. A 45 km Port Coquitlam to downtown loop with a plug is a PHEV conversation. Two car seats every day plus a grandmother on Sunday is an Outlander, and you still tell them the third row is for short hops. Twenty minutes on a lunch break gets one question, one car and a booked return. A tour of the lineup is how you run out the clock.',
  },
  {
    skill: 'objection',
    title: 'Isolate the Surrey screenshot',
    body: 'Price objections are missing facts. Ask to see the ad. Compare year, trim, kilometres, freight, PDI and whether the car is on the ground. An ES payment is not an SE payment. If the other store is truly cheaper on the same car, involve your manager before the customer burns an hour. Do not trash the other store and do not promise a number you cannot sign.',
  },
  {
    skill: 'benefit',
    title: 'Two features, then a question',
    body: 'A feature dump is a brochure they can read without you. Pick the two items that match what they just said. Heated wheel for the person who parks outside. Hands-free liftgate for the parent with a kid on the hip. HUD for the night driver, which means GT, not LE. Say what it changes in their week. Then ask if that is the one. If you cannot tie it to their week, do not say it.',
  },
  {
    skill: 'finance',
    title: 'Show the total, not just the monthly',
    body: 'A payment is a structure: price, down payment, term, rate, taxes, fees, and anything you rolled from the trade. Stretching the term lowers the monthly and raises the total. Say both. Lease caps live or die on yearly kilometres, so ask before you quote 12,000. Campaign payments on the website are ads with conditions. The desk quotes this customer and this unit. You do not invent a rate, and you do not promise a rebate until eligibility is confirmed.',
  },
  {
    skill: 'trade',
    title: 'Two numbers, no insults',
    body: 'The trade is one number and the new vehicle is another. Do not bury a weak appraisal inside a fake discount. Do not name a figure in the aisle before anyone has seen the car. Service records help. Negative equity gets written on the page, then they can roll it, write a cheque, or both. Hiding it inside a long term is how people end up upside-down twice. And do not insult a car they maintained.',
  },
  {
    skill: 'close',
    title: 'Ask, then wait',
    body: 'When the car fits, ask a closed question: if the out-the-door number lands where you discussed, are they taking it. Then wait. Filling the silence with a new discount teaches them the first number was fiction. If they stall, ask which item is open: payment, partner, trade, or a feature. Book that next step. A spouse who has to see it is a real buyer. Send the exact stock card and put both of them in the vehicle. Fake scarcity on a car you have in depth will get back to the tower.',
  },
  {
    skill: 'trust',
    title: 'The limit is part of the pitch',
    body: 'Third-row legroom is about 475 mm. Cargo behind that row is about 308 litres. S-AWC is not a winter tire and not a guarantee you will make Cypress in a storm. Driver aids have limits and hands stay on the wheel. The Mirage is not coming back as an order. Say the limit before they discover it on Saturday. People buy from the rep who will talk them out of the wrong car.',
  },
  {
    skill: 'phev',
    title: 'Worst day, not average day',
    body: 'The 2026 Outlander PHEV is rated around 72 km electric and 690 km combined, with a 22.7 kWh pack. 3.2 is Le/100 km, not pump litres. Gas-only operation is about 8.6 L/100 km. Winter cuts the electric number. Innovative Pedal still needs the brake to fully stop. Level 1 charging is about 16.5 hours from empty, Level 2 about 6.5 hours, CHAdeMO about 29 minutes to 80 percent. Ask where the car sleeps before you promise a charger, and do not call the gas Outlander\'s 48-volt system a plug-in.',
  },
]

export const words = [
  { word: 'LEASE', tip: 'A lease lives or dies on the kilometre cap. Ask yearly driving before you quote a pretty payment.' },
  { word: 'TRADE', tip: 'The trade is its own number. Do not bury a light appraisal inside a discount.' },
  { word: 'TRUST', tip: 'Trust is quoting the limit out loud: third-row room, winter range, the fee on the worksheet.' },
  { word: 'CLOSE', tip: 'Ask for the business, then wait. Do not fill the silence with a new discount.' },
  { word: 'BADGE', tip: 'Noir is a styling badge, not a new engine. Read the trim under it.' },
  { word: 'VALUE', tip: 'Value is equipment they will use plus warranty plus payment. It is not a shouted discount.' },
  { word: 'OFFER', tip: 'An offer has term, down payment, fees and taxes. An MSRP alone is not an offer.' },
  { word: 'PITCH', tip: 'A pitch is two features tied to their Tuesday, then a question. Not a tour.' },
  { word: 'FLOOR', tip: 'The floor is shared. Vote in a teammate\'s duel like the customer is yours.' },
  { word: 'DRIVE', tip: 'The drive should include the thing they feared: the on-ramp, the parkade, the get-in.' },
  { word: 'MOTOR', tip: 'The PHEV uses twin motors plus a 2.4L. The gas Outlander is a 1.5L turbo mild hybrid. Different motors.' },
  { word: 'CARGO', tip: '308 litres behind the Outlander\'s third row. Fold it before you promise the stroller and the luggage.' },
  { word: 'WHEEL', tip: 'Heated steering wheel starts at Outlander SE, Eclipse Cross SE, and RVR SEL. Know which car you are in.' },
  { word: 'PEDAL', tip: 'Innovative Pedal is near one-pedal driving. The brake is still required for a full stop.' },
  { word: 'TURBO', tip: 'Eclipse Cross and the gas Outlander are turbos. RVR ES is a 2.0L. Do not share the word carelessly.' },
  { word: 'BRAKE', tip: 'Forward collision mitigation is an aid, not a promise the car cannot hit something.' },
  { word: 'STEER', tip: 'Lane departure prevention does not mean self-driving. Hands stay on the wheel.' },
  { word: 'QUOTA', tip: 'The quota does not pick the car. Their Wednesday does. A wrong unit comes back.' },
  { word: 'GROSS', tip: 'Gross follows the right vehicle. Leading with the GT because the gross is pretty is how you lose Priya.' },
  { word: 'TITLE', tip: 'If a lien is on the trade, say so early. Surprise titles kill deliveries.' },
  { word: 'MODEL', tip: 'Model year matters. 2024 Mirage was the last. Do not sell a 2026 Mirage from memory.' },
  { word: 'BUYER', tip: 'The buyer is everyone who has to say yes, including the spouse who is still at work.' },
  { word: 'SALES', tip: 'Sales is a service job with a pen at the end. Product knowledge is the service.' },
  { word: 'MONTH', tip: 'Month-end pressure is yours, not theirs. Do not invent a deadline the factory did not set.' },
  { word: 'BOOST', tip: 'The gas Outlander\'s 48-volt system adds a boost. It does not add a plug.' },
  { word: 'GAUGE', tip: 'On the gas Outlander the 12.3-inch digital cluster starts at SEL. The centre screen is already on ES.' },
  { word: 'VALET', tip: 'At delivery, pair the phone and enroll Connect. A confused Thursday is a sales problem.' },
  { word: 'QUOTE', tip: 'A quote without freight, PDI and tax is how a Surrey screenshot beats you.' },
  { word: 'TERMS', tip: 'Warranty terms are whichever comes first. Say the years and the kilometres.' },
  { word: 'RATES', tip: 'Rates come from the desk or the customer\'s bank. They do not come from a hopeful sentence.' },
  { word: 'MONEY', tip: 'If the payment only works by hiding a fee, you do not have a deal. You have a future complaint.' },
  { word: 'PRICE', tip: 'Price the trim they are sitting in. ES, SE and PHEV ES are three different sentences.' },
  { word: 'PANEL', tip: 'Walk the trade panels with them. Records and a calm walkaround beat a shrug.' },
  { word: 'HATCH', tip: 'Hands-free liftgate is an SE feature on Outlander and Eclipse Cross. Demo it only if the car has it.' },
  { word: 'SEDAN', tip: 'If they want a Corolla, respect it. Compare warranty and winter driving. Do not insult the sedan.' },
  { word: 'WAGON', tip: 'Cargo shape matters more than the badge. Make them put the stroller in.' },
  { word: 'VISOR', tip: 'HomeLink lives in a mirror, and on the gas Outlander that mirror step is SEL. Garage people ask.' },
  { word: 'SPARE', tip: 'Do not promise a full-size spare you have not seen on the unit. Check, then answer.' },
  { word: 'ALIGN', tip: 'If they mention a pull or a vibration on the test drive, write it up. Do not talk them out of a feeling.' },
]

for (const scenarioItem of scenarios) {
  if (!scenarioItem.hidden || !scenarioItem.recommend) throw new Error(`Scenario incomplete ${scenarioItem.id}`)
}
if (objections.length < 25) throw new Error('Need 25 objections')
for (const objection of objections) {
  if (objection.responses.length !== 4) throw new Error(`Responses ${objection.id}`)
  const best = objection.responses.filter((r) => r.quality === 'best')
  if (best.length !== 1) throw new Error(`Best count ${objection.id}`)
}
if (competitors.length < 8) throw new Error('Need 8 competitors')
for (const rival of competitors) {
  if (rival.cards.length < 6) throw new Error(`Cards ${rival.id}`)
}
if (words.length < 30) throw new Error('Need words')
