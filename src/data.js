// All facts verified on mba.com (GMAC) on 22–23 Nov 2026. Cite mba.com; no scraping.
export const VERIFIED_AT = "2026-11-23";

// Official GMAT (Focus Edition) Total Score percentiles, mba.com "Understanding Your Score",
// Detailed table. Sample size 509,182; SD 94.24; mean 554.94; data period 2021–2026.
export const PERCENTILES = {
  805:100,795:100,785:100,775:100,765:100,755:100,745:100,735:99,725:99,715:99,
  705:98,695:97,685:95,675:94,665:91,655:90,645:86,635:81,625:78,615:75,
  605:69,595:66,585:60,575:57,565:50,555:47,545:42,535:39,525:34,515:32,
  505:27,495:25,485:22,475:20,465:17,455:16,445:13,435:12,425:10,415:9,
  405:8,395:7,385:6,375:5,365:4,355:4,345:3,335:3,325:2,315:2,
  305:2,295:1,285:1,275:1,265:1,255:1,245:0,235:0,225:0,215:0,205:0
};
export const PERCENTILE_META = {
  source: "mba.com, Understanding Your Score (GMAT Focus Total Score Percentiles, Detailed)",
  sample_size: 509182, mean: 554.94, standard_deviation: 94.24, data_period: "2021-2026",
  scale: { min: 205, max: 805, step: 10 }
};

// Fees in USD, GMAC pricing for Mexico (also Ecuador, Colombia, Peru). Spain is in EUR.
export const FEES = {
  currency: "USD",
  countries: ["MX", "EC", "CO", "PE"],
  registration: { test_center: 250, online: 275 },
  reschedule: [
    { window: "more than 60 days before", test_center: 50, online: 55 },
    { window: "15 to 60 days before", test_center: 100, online: 110 },
    { window: "14 days or fewer before", test_center: 150, online: 165 }
  ],
  cancellation_refund: [
    { window: "more than 60 days before", test_center: 100, online: 110 },
    { window: "15 to 60 days before", test_center: 75, online: 80 },
    { window: "14 days or fewer before", test_center: 50, online: 55 },
    { window: "within 24 hours", test_center: 0, online: 0 }
  ],
  additional_score_report: 35,
  spain_eur: { test_center: 275, online: 300 },
  note: "Local taxes may apply. Verify the current amount on mba.com before paying."
};

export const EXAM = {
  name: "GMAT Exam (Focus Edition)",
  owner: "Graduate Management Admission Council (GMAC)",
  total_score: { min: 205, max: 805, step: 10 },
  section_score: { min: 60, max: 90 },
  sections: [
    { name: "Quantitative Reasoning", questions: 21, minutes: 45 },
    { name: "Verbal Reasoning", questions: 23, minutes: 45 },
    { name: "Data Insights", questions: 20, minutes: 45 }
  ],
  total_minutes: 135,
  optional_break_minutes: 10,
  attempts: { per_rolling_12_months: 5, min_days_between: 16, lifetime_cap: null },
  score_validity_years: 5,
  programs_accepting: "2,400+ programs worldwide",
  delivery: ["test center", "online at home"],
  source: "mba.com (GMAC)"
};

// Original questions written for gmat.mx (CC BY 4.0). Not from any official GMAT source.
export const QUESTIONS = [
  { id: "q1", section: "Quantitative Reasoning", type: "Problem Solving", topic: "Inequalities", difficulty: "easy",
    stem: "What is the smallest integer x that satisfies 4x + 5 > 33?",
    choices: { A: "7", B: "8", C: "10", D: "28", E: "29" }, answer: "B",
    explanation: "Subtract 5 from both sides: 4x > 28, so x > 7. The smallest integer greater than 7 is 8.",
    trap: "An off-by-one slip at the boundary (7), or dropping the coefficient 4 (29)." },
  { id: "q2", section: "Quantitative Reasoning", type: "Problem Solving", topic: "Averages: removing a value", difficulty: "easy",
    stem: "The average (arithmetic mean) of a set of 10 numbers is 27. If one of the numbers, 45, is removed from the set, what is the average of the remaining 9 numbers?",
    choices: { A: "22.5", B: "25", C: "27", D: "30", E: "45" }, answer: "B",
    explanation: "Original sum 27×10 = 270. Removing 45 leaves 225; dividing by 9 gives 25.",
    trap: "Dividing by 10 instead of 9 (22.5), or dividing 270 by 9 without subtracting (30)." },
  { id: "q3", section: "Quantitative Reasoning", type: "Problem Solving", topic: "Mixtures and concentration", difficulty: "medium",
    stem: "A tank contains 50 liters of a coolant mixture that is 30 percent antifreeze by volume. How many liters of pure antifreeze must be added so that the resulting mixture is 50 percent antifreeze by volume?",
    choices: { A: "10", B: "20", C: "30", D: "50", E: "70" }, answer: "B",
    explanation: "Start with 15 L of antifreeze. If x liters are added, 15 + x = 0.50(50 + x), so 0.5x = 10 and x = 20.",
    trap: "(0.50 − 0.30)×50 = 10, or reporting the new total volume 70." },
  { id: "q4", section: "Verbal Reasoning", type: "Critical Reasoning", topic: "Paradox", difficulty: "easy",
    stem: "At Cindergate Marsh, reported sightings of herons, a natural predator of the marsh chorus frog, increased substantially. Despite this, the marsh chorus frog population at the marsh held steady over the same period. Which of the following, if true, most helps to resolve the apparent discrepancy?",
    choices: { A: "Herons also prey on small fish found in the marsh.",
      B: "A newly planted stand of reeds gave marsh chorus frogs more cover in which to hide from herons.",
      C: "The marsh chorus frog breeding season lasts about ten weeks.",
      D: "Heron sightings are typically recorded by volunteer birdwatchers rather than by wildlife biologists.",
      E: "The marsh chorus frog population declined at a nearby wetland during the same period." }, answer: "B",
    explanation: "New reed cover supplies a mechanism that offsets the predator increase, keeping the population steady.",
    trap: "An unrelated fact about herons (A) instead of a fact that shields the frogs." },
  { id: "q5", section: "Verbal Reasoning", type: "Critical Reasoning", topic: "Evaluate", difficulty: "medium",
    stem: "Cobalt Brewery reformulated its best-selling ale using a cheaper hop variety, and the brewery's head brewer predicts that sales volume will not decline as a result. Which of the following questions, if answered, would most help to evaluate the prediction above?",
    choices: { A: "How much money the cheaper hop variety saves the brewery per barrel.",
      B: "Whether other breweries have reformulated recipes using cheaper ingredients.",
      C: "Whether blind tasters rated the reformulated ale as similar to the original recipe.",
      D: "What the brewery's total sales volume is compared with its competitors.",
      E: "Whether the new hop variety is grown in the same region as the original." }, answer: "C",
    explanation: "The prediction depends on customers not noticing the change; blind-taster similarity tests exactly that.",
    trap: "A cost or comparison question mistaken for a test of whether the change is detectable." },
  { id: "q6", section: "Data Insights", type: "Data Sufficiency", topic: "Rates and average speed", difficulty: "easy",
    stem: "A truck drove from Town P to Town Q and then back to Town P along the same route, at a possibly different speed for each leg. What was the truck's average speed for the entire round trip? (1) The distance from Town P to Town Q is 120 miles. (2) The truck drove from P to Q at 40 miles per hour and from Q to P at 60 miles per hour.",
    choices: { A: "Statement (1) ALONE is sufficient, but statement (2) alone is not sufficient.",
      B: "Statement (2) ALONE is sufficient, but statement (1) alone is not sufficient.",
      C: "BOTH statements TOGETHER are sufficient, but NEITHER statement ALONE is sufficient.",
      D: "EACH statement ALONE is sufficient.",
      E: "Statements (1) and (2) TOGETHER are NOT sufficient." }, answer: "B",
    explanation: "For equal-distance legs the average speed is 2×40×60/(40+60) = 48 mph regardless of distance, so (2) alone suffices and (1) alone does not.",
    trap: "Assuming the distance is still needed (C)." },
  { id: "q7", section: "Data Insights", type: "Two-Part Analysis", topic: "Rates and cost", difficulty: "easy",
    stem: "A delivery van is making a 270-mile trip. The van gets 18 miles per gallon, and fuel costs 3.60 dollars per gallon. Select the number of gallons of fuel the trip requires, and select the total fuel cost for the trip, in dollars.",
    choices: { options: ["15", "75", "270", "54", "4860", "18"] },
    answer: { gallons: "15", total_cost_dollars: "54" },
    explanation: "270 ÷ 18 = 15 gallons; 15 × 3.60 = 54 dollars.",
    trap: "Dividing by the price per gallon (75), or multiplying distance by fuel economy (4860)." }
];
