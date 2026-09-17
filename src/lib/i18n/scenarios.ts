import { IntegrityScenario } from '@/types';

export const LOCALIZED_SCENARIOS_EN: Record<string, Partial<IntegrityScenario>> = {
  scenario_academic_integrity: {
    title: 'Academic Integrity: Exam Room & Peer Pressure',
    topicTitle: 'Academic Honesty',
    shortDescription: 'A close friend pleads for an answer to a crucial question during the final exam.',
    detailedDilemma: 'During the final Mathematics exam, while the proctor was busy distributing extra answer sheets, your close friend leaned over whispering frantically for the answer to question #3, threatening that failing would ruin your friendship.',
    dilemmaQuote: 'Your friend whispers: "Help me with question 3 quickly before the proctor turns around.. If you don\'t help me now, don\'t consider me your friend!"',
    cognitiveBasis: 'Cognitive Behavioral Therapy (CBT) - Aaron Beck (Reframing cognitive distortions & resisting peer pressure)',
    visualDetails: {
      locationBadge: 'Exam Hall',
      roomLabel: 'Hall 302',
      promptNote: '⚠️ Final Exam Paper - Friend: "Help me fast!"',
    },
    badgeName: 'Academic Honor Ambassador',
    questions: [
      {
        id: 'academic_q1',
        order: 1,
        question: 'What is your decision and action in this situation?',
        explanation: 'Academic integrity protects fairness and equal opportunity. True friendship is never built on compromising trust.',
        options: [
          {
            id: 'academic_opt_1',
            text: 'Remain focused on your exam, politely decline passing the answer, and explain your moral stance calmly after the exam ends.',
            score: 100,
            feedback: 'Exemplary and heroic choice! Upholding academic integrity ensures fairness and encourages your friend to rely on themselves in the future.',
            whyWrong: '',
            correctActionText: 'Staying focused and refusing to participate in cheating protects fairness for everyone. True loyalty to friends means studying together before exams, not breaking rules during them.',
          },
          {
            id: 'academic_opt_2',
            text: 'Whisper part of the answer or write it on an eraser to help them pass without getting caught.',
            score: 0,
            feedback: 'Participating in cheating violates school ethics and exposes both of you to immediate disqualification.',
            whyWrong: 'Giving into peer pressure by cheating compromises your own integrity and undermines academic fairness.',
            correctActionText: 'Politely refuse and offer to study together after the exam.',
          },
          {
            id: 'academic_opt_3',
            text: 'Shout loudly to alert the exam proctor in front of the entire class.',
            score: 50,
            feedback: 'Disruptive reaction that causes panic in the exam hall. A firm personal refusal followed by quiet consultation is much more effective.',
            whyWrong: 'Publicly causing a scene disrupts other students during high-stakes testing.',
            correctActionText: 'Quietly refuse during the exam and talk to your friend or teacher privately afterwards.',
          },
          {
            id: 'academic_opt_4',
            text: 'Hand your entire paper to them and accept whatever consequence happens.',
            score: 0,
            feedback: 'Extreme breach of academic honesty that results in immediate exam cancellation.',
            whyWrong: 'Completely surrendering academic principles harms your future and your friend\'s accountability.',
            correctActionText: 'Protect your integrity and uphold test guidelines at all times.',
          },
        ],
      },
    ],
  },
  scenario_cafeteria_money: {
    title: 'Financial Honesty: Large Cash Envelope in Cafeteria',
    topicTitle: 'Financial Trust',
    shortDescription: 'Finding a sealed cash envelope on a lunch table during recess.',
    detailedDilemma: 'While sitting at cafeteria table #12 during lunch recess, you discovered a thick envelope containing 500 Egyptian pounds (EGP) with no name written on the outside. A classmate suggested splitting the money and keeping quiet since nobody saw.',
    dilemmaQuote: 'Classmate suggests: "Nobody saw it! We can split the 500 pounds right now and treat everyone, nobody will ever find out!"',
    cognitiveBasis: 'Moral Development Theory - Lawrence Kohlberg (Post-conventional moral reasoning and intrinsic values)',
    visualDetails: {
      locationBadge: 'Main Cafeteria',
      roomLabel: 'Dining Table #12',
      promptNote: '💵 Cash Envelope - Peer: "Let\'s split it!"',
    },
    badgeName: 'Financial Trust Champion',
    questions: [
      {
        id: 'money_q1',
        order: 1,
        question: 'What is your principled decision in this situation?',
        explanation: 'Found money represents someone\'s livelihood or emergency funds. Immediate custody handover to school administration is paramount.',
        options: [
          {
            id: 'money_opt_1',
            text: 'Refuse to split the cash, take the envelope immediately to the School Administration Lost & Found office, and request an official custody receipt.',
            score: 100,
            feedback: 'Outstanding integrity! Handing over the money immediately to school management protects student rights and ensures secure verification.',
            whyWrong: '',
            correctActionText: 'Depositing found funds at the administration office ensures the rightful owner can verify the amount and claim it securely.',
          },
          {
            id: 'money_opt_2',
            text: 'Agree to take half the money and let your friend take the rest.',
            score: 0,
            feedback: 'Unlawful appropriation of lost property that destroys trust and violates school ethics.',
            whyWrong: 'Taking money that is not yours causes significant distress to the owner.',
            correctActionText: 'Always hand in found money to the school administration immediately.',
          },
          {
            id: 'money_opt_3',
            text: 'Keep the envelope in your pocket and announce loudly in the playground that you have 500 pounds.',
            score: 50,
            feedback: 'Publicly announcing the exact amount invites false claims and undermines secure ownership verification.',
            whyWrong: 'Revealing the exact cash amount allows anyone to falsely claim it without proof.',
            correctActionText: 'Hand the money to administration without publicly disclosing the exact sum.',
          },
          {
            id: 'money_opt_4',
            text: 'Leave the envelope on the cafeteria table and walk away.',
            score: 0,
            feedback: 'Negligence that exposes the lost funds to theft or loss by passersby.',
            whyWrong: 'Abandoning found valuables leaves them vulnerable to theft.',
            correctActionText: 'Take proactive custody and hand it directly to school officials.',
          },
        ],
      },
    ],
  },
  scenario_lab_microscope: {
    title: 'Accountability: Accidentally Damaged Lab Equipment',
    topicTitle: 'Personal Accountability',
    shortDescription: 'Accidentally knocking over a precision electronic microscope in the science lab.',
    detailedDilemma: 'While adjusting your science experiment in the chemistry lab after the bell rang, your lab coat caught the power cord of a sensitive digital microscope, knocking it to the floor. The lens cracked, and nobody was looking in your direction.',
    dilemmaQuote: 'Internal voice: "Nobody saw you trip over the cord.. You can just leave quietly and let them assume it was broken during the previous period!"',
    cognitiveBasis: 'Acceptance and Commitment Therapy (ACT) - Value-guided action and accountability over fear',
    visualDetails: {
      locationBadge: 'Science & Chemistry Lab',
      roomLabel: 'Workstation #3',
      promptNote: '🔬 Cracked Microscope Lens - Inner thought: "Nobody saw!"',
    },
    badgeName: 'Civic Responsibility Ambassador',
    questions: [
      {
        id: 'lab_q1',
        order: 1,
        question: 'What is your courageous, ethical response?',
        explanation: 'Courageous honesty in admitting accidents fosters a culture of safety and earns profound respect from educators.',
        options: [
          {
            id: 'lab_opt_1',
            text: 'Report the accident immediately to the science teacher/lab supervisor, explain honestly what happened, and offer to assist with repair protocols.',
            score: 100,
            feedback: 'True moral courage! Owning up to honest mistakes builds unshakeable character and earns deep respect from teachers.',
            whyWrong: '',
            correctActionText: 'Immediate, honest reporting allows the school to safely handle equipment and prevents innocent classmates from being blamed.',
          },
          {
            id: 'lab_opt_2',
            text: 'Quickly put the broken microscope back on the shelf and leave the lab without telling anyone.',
            score: 0,
            feedback: 'Dishonest evasion of responsibility that could lead to unfair collective punishment for your peers.',
            whyWrong: 'Hiding damage endangers lab safety and breaches basic integrity.',
            correctActionText: 'Admit accidents immediately; schools appreciate honesty and handle unintentional damage constructively.',
          },
          {
            id: 'lab_opt_3',
            text: 'Blame your lab partner when questioned the following morning.',
            score: 0,
            feedback: 'Severe ethical violation that harms innocent friends and damages relationships.',
            whyWrong: 'Falsely blaming others is destructive and deeply unethical.',
            correctActionText: 'Take full personal responsibility for your own actions.',
          },
          {
            id: 'lab_opt_4',
            text: 'Try to glue the optical lens with adhesive secretly.',
            score: 50,
            feedback: 'Amateur repairs can permanently damage precision optical sensors and worsen equipment status.',
            whyWrong: 'Secret makeshift repairs cause further damage to delicate lab sensors.',
            correctActionText: 'Notify the lab technician immediately for professional maintenance.',
          },
        ],
      },
    ],
  },
  scenario_team_project: {
    title: 'Intellectual Honesty: Teamwork & Credit Attribution',
    topicTitle: 'Intellectual Property',
    shortDescription: 'Submitting a competition project where one student did the bulk of the programming.',
    detailedDilemma: 'In a school STEM robotics competition, your group won 1st place. The judges specifically praised a sophisticated code algorithm that your teammate Sarah stayed up all night coding alone, while the rest of the team only made the PowerPoint slides.',
    dilemmaQuote: 'Judge asks: "Who designed this incredible algorithm?" Teammate whispers: "Just say we all built it together so we get equal distinction!"',
    cognitiveBasis: 'Social Cognition Theory - Albert Bandura (Fair credit attribution & psychological safety)',
    visualDetails: {
      locationBadge: 'Innovation Hub',
      roomLabel: 'Robotics Stage',
      promptNote: '🏆 STEM Trophy - Teammate: "Say we all did it equally!"',
    },
    badgeName: 'Intellectual Honesty Ambassador',
    questions: [
      {
        id: 'team_q1',
        order: 1,
        question: 'What is your principled statement to the evaluation committee?',
        explanation: 'Intellectual honesty honors authentic individual effort while celebrating collective team spirit.',
        options: [
          {
            id: 'team_opt_1',
            text: 'Publicly credit Sarah for engineering the core algorithm while highlighting how the rest of the team supported documentation and presentation.',
            score: 100,
            feedback: 'Brilliant leadership and intellectual fairness! Giving credit where credit is due elevates the entire team\'s reputation.',
            whyWrong: '',
            correctActionText: 'Acknowledging individual technical contributions builds trust and inspires genuine collaboration.',
          },
          {
            id: 'team_opt_2',
            text: 'Claim that you personally programmed the algorithm to win the individual prize.',
            score: 0,
            feedback: 'Blatant plagiarism and theft of a peer\'s intellectual labor.',
            whyWrong: 'Taking false personal credit destroys team trust and constitutes academic dishonesty.',
            correctActionText: 'Always give full credit to the true creator of the work.',
          },
          {
            id: 'team_opt_3',
            text: 'Stay completely silent and let the judges assume everyone contributed identically.',
            score: 50,
            feedback: 'Passive omission diminishes the exceptional effort of the student who did the heavy lifting.',
            whyWrong: 'Remaining silent when credit is misattributed overlooks outstanding individual effort.',
            correctActionText: 'Speak up proactively to praise your teammate\'s hard work.',
          },
          {
            id: 'team_opt_4',
            text: 'Argue with the judges about why algorithm scores should not count.',
            score: 0,
            feedback: 'Inappropriate reaction that deflects from the evaluation criteria.',
            whyWrong: 'Deflecting discussion avoids giving due recognition.',
            correctActionText: 'Focus on highlighting your teammate\'s genuine technical achievement.',
          },
        ],
      },
    ],
  },
  scenario_private_phone: {
    title: 'Digital Privacy: Found Smartphone with Incoming Messages',
    topicTitle: 'Digital Privacy',
    shortDescription: 'Finding an unlocked smartphone in the library showing private notification popups.',
    detailedDilemma: 'While studying in the quiet reading corner of the library, you found an unlocked high-end smartphone on the chair. Continuous private family messages and photo alerts began popping up on the lock screen.',
    dilemmaQuote: 'Classmate says: "Let\'s open the photo gallery and read the group chats before giving it back, nobody will know!"',
    cognitiveBasis: 'Digital Citizenship & Ethical Information Ethics - Respecting personal boundaries and data privacy',
    visualDetails: {
      locationBadge: 'School Main Library',
      roomLabel: 'Reading Pod #4',
      promptNote: '📱 Unlocked Phone - Peer: "Let\'s browse photos!"',
    },
    badgeName: 'Digital Privacy Guardian',
    questions: [
      {
        id: 'phone_q1',
        order: 1,
        question: 'What is your principled action regarding digital privacy?',
        explanation: 'Personal digital devices contain private family and sensitive data. Looking through them violates ethical and cyber safety laws.',
        options: [
          {
            id: 'phone_opt_1',
            text: 'Turn the screen off immediately without reading any notifications, log a found item report on FindIt with a secret question, or deliver it to the library desk.',
            score: 100,
            feedback: 'Supreme respect for digital privacy! Guarding personal boundaries is the cornerstone of modern digital citizenship.',
            whyWrong: '',
            correctActionText: 'Turning off the screen and handing in the phone preserves student privacy and protects sensitive family information.',
          },
          {
            id: 'phone_opt_2',
            text: 'Unlock the phone, open social media apps, and browse personal photos with your friends.',
            score: 0,
            feedback: 'Severe violation of privacy and cyber ethics that exposes you to school disciplinary actions.',
            whyWrong: 'Snooping through someone\'s personal phone is a grave privacy breach.',
            correctActionText: 'Never browse contents on found devices under any circumstance.',
          },
          {
            id: 'phone_opt_3',
            text: 'Post a status on the owner\'s social media accounts saying "Found your phone!".',
            score: 50,
            feedback: 'Unauthorized access to accounts can cause social embarrassment and confusion for the owner\'s contacts.',
            whyWrong: 'Posting from someone else\'s device creates confusion and oversteps privacy boundaries.',
            correctActionText: 'Use official school channels (FindIt or Administration) to return the device safely.',
          },
          {
            id: 'phone_opt_4',
            text: 'Take the phone home with you until the owner calls.',
            score: 0,
            feedback: 'Removing school belongings off-campus delays recovery and can be mistaken for theft.',
            whyWrong: 'Taking lost campus items home prevents immediate same-day recovery.',
            correctActionText: 'Always keep found items within school premises and hand them to authorized staff.',
          },
        ],
      },
    ],
  },
};

export function getLocalizedScenario(
  scenario: IntegrityScenario,
  lang: 'ar' | 'en' = 'ar'
): IntegrityScenario {
  if (lang !== 'en') return scenario;

  const enOverride = LOCALIZED_SCENARIOS_EN[scenario.id];
  if (!enOverride) return scenario;

  return {
    ...scenario,
    ...enOverride,
    visualDetails: {
      ...scenario.visualDetails,
      ...(enOverride.visualDetails || {}),
    },
    questions: enOverride.questions || scenario.questions,
  };
}
