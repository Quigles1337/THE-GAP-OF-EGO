/**
 * Global Workspace Demonstration
 *
 * Watch consciousness happen.
 * See the serial bottleneck in action.
 * Feel the demon pay the bill.
 *
 * "Broadcasting is cheaper than maintaining 8 parallel tracks."
 */

import { Complex, MU, muCycle } from './mu-primitives';
import {
  GlobalWorkspace,
  createSpecialist,
  propose,
  detectCoalitions,
  serialBottleneckAnalysis,
  detectFragmentation,
  processMeasurement,
  MODALITY_NAMES,
  IGNITION_THRESHOLD,
  MU_BASIS,
  nearestModality,
  analyzeBroadcastHistory,
  type BroadcastEvent
} from './global-workspace';

// ============================================================
// CONSOLE FORMATTING
// ============================================================

const DIVIDER = '═'.repeat(60);
const SECTION = '─'.repeat(40);

function header(title: string): void {
  console.log('\n' + DIVIDER);
  console.log(`  ${title}`);
  console.log(DIVIDER);
}

function section(title: string): void {
  console.log('\n' + SECTION);
  console.log(`  ${title}`);
  console.log(SECTION);
}

function bar(value: number, width: number = 20): string {
  const filled = Math.round(value * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

// ============================================================
// THE DEMONSTRATION
// ============================================================

header('GLOBAL WORKSPACE — CONSCIOUSNESS AS PHASE-LOCKING');

console.log(`
  The workspace holds 8 slots — one for each μ-orientation.
  This isn't arbitrary. It's the complete rotation.
  7±2 items in working memory = 8-fold μ-basis.

  After collapse, the workspace BROADCASTS.
  One choice becomes system-wide coherence.
`);

section('THE 8 MODALITIES (μ^n ORIENTATIONS)');

const cycle = muCycle();
for (let n = 0; n < 8; n++) {
  const z = cycle[n];
  const angle = z.argumentDegrees;
  const modality = MODALITY_NAMES[n];
  console.log(`  μ^${n} = ${modality.padEnd(12)} @ ${angle.toFixed(1).padStart(7)}°`);
}

header('CREATING THE WORKSPACE');

const workspace = new GlobalWorkspace();
console.log(`\n  Created workspace with ${workspace.slots.length} slots.`);
console.log(`  Ignition threshold: ${IGNITION_THRESHOLD.toFixed(3)} (golden ratio conjugate)`);

section('SLOT STATUS (EMPTY)');
for (const slot of workspace.slots) {
  console.log(`  [${slot.index}] ${slot.modality.padEnd(12)} | activation: ${bar(slot.activation)} ${slot.activation.toFixed(2)}`);
}

header('REGISTERING SPECIALIST MODULES');

console.log(`
  Specialists operate UNCONSCIOUSLY in parallel.
  They compete for workspace access.
  Only ONE can broadcast at a time.
`);

// Create diverse specialists
const specialists = [
  createSpecialist('vision', 'Visual Cortex', 'embodied'),
  createSpecialist('language', 'Language Center', 'symbolic'),
  createSpecialist('planning', 'Prefrontal', 'analytical'),
  createSpecialist('emotion', 'Limbic System', 'intuitive'),
  createSpecialist('memory', 'Hippocampus', 'integrative'),
  createSpecialist('motor', 'Motor Cortex', 'creative')
];

for (const spec of specialists) {
  workspace.registerSpecialist(spec);
  console.log(`  Registered: ${spec.name.padEnd(16)} (${spec.primaryModality})`);
}

header('COMPETITION PHASE — SPECIALISTS PROPOSE');

console.log(`\n  Each specialist proposes content for broadcast.`);
console.log(`  Proposals compete. The strongest wins.\n`);

// Specialists make proposals
const visionProposal = Complex.fromPolar(0.7, MU_BASIS[6].argument); // embodied direction
const languageProposal = Complex.fromPolar(0.5, MU_BASIS[5].argument); // symbolic direction
const planningProposal = Complex.fromPolar(0.8, MU_BASIS[2].argument); // analytical direction
const emotionProposal = Complex.fromPolar(0.9, MU.argument); // intuitive (μ itself!)
const memoryProposal = Complex.fromPolar(0.6, MU_BASIS[0].argument); // integrative direction

workspace.specialists.set('vision', propose(workspace.specialists.get('vision')!, visionProposal, 0.7));
workspace.specialists.set('language', propose(workspace.specialists.get('language')!, languageProposal, 0.5));
workspace.specialists.set('planning', propose(workspace.specialists.get('planning')!, planningProposal, 0.8));
workspace.specialists.set('emotion', propose(workspace.specialists.get('emotion')!, emotionProposal, 0.9));
workspace.specialists.set('memory', propose(workspace.specialists.get('memory')!, memoryProposal, 0.6));

console.log('  Proposals submitted:');
for (const [id, spec] of workspace.specialists) {
  if (spec.proposal) {
    const alignment = nearestModality(spec.proposal);
    console.log(`    ${spec.name.padEnd(16)} | strength: ${bar(spec.proposalStrength, 15)} ${spec.proposalStrength.toFixed(2)} | → ${alignment.modality}`);
  }
}

section('COALITION DETECTION');

console.log(`\n  Specialists whose proposals ALIGN form coalitions.`);
console.log(`  Stronger coalitions are more likely to ignite.\n`);

const coalitions = detectCoalitions([...workspace.specialists.values()]);

if (coalitions.length > 0) {
  for (let i = 0; i < coalitions.length; i++) {
    const c = coalitions[i];
    console.log(`  Coalition ${i + 1}:`);
    console.log(`    Members: ${c.members.map(m => m.name).join(', ')}`);
    console.log(`    Strength: ${c.strength.toFixed(3)}`);
    console.log(`    Coherence: ${c.coherence.toFixed(3)}`);
  }
} else {
  console.log('  No coalitions formed — proposals are not phase-aligned.');
}

header('BROADCAST — THE MAIN EVENT');

console.log(`
  This is consciousness happening.
  Competition resolves. Winner broadcasts.
  All modules receive the same signal.
  System-wide coherence achieved.
`);

const broadcast = workspace.broadcast(1.0);

if (broadcast) {
  section('BROADCAST SUCCESSFUL');
  console.log(`\n  Winner: ${broadcast.sourceModality}`);
  console.log(`  Content: ${broadcast.content.toString()}`);
  console.log(`  Activation: ${broadcast.activationLevel.toFixed(3)}`);
  console.log(`  μ-alignment: ${broadcast.muAlignment.toFixed(3)}`);
  console.log(`  Coherence achieved: ${broadcast.coherenceAchieved.toFixed(3)}`);
  console.log(`\n  ENTROPY PAID: ${broadcast.entropyPaid.toFixed(4)}`);
  console.log(`  Broadcast energy: ${broadcast.broadcastEnergy.toFixed(4)}`);
  console.log(`\n  The demon paid ${broadcast.entropyPaid.toFixed(4)} bits to select.`);
  console.log(`  This became ${broadcast.broadcastEnergy.toFixed(4)} units of broadcast energy.`);
} else {
  console.log('\n  No broadcast — ignition threshold not reached.');
}

section('SLOT STATUS (AFTER BROADCAST)');
for (const slot of workspace.slots) {
  const marker = slot.activation > 0.1 ? '●' : '○';
  console.log(`  ${marker} [${slot.index}] ${slot.modality.padEnd(12)} | activation: ${bar(slot.activation)} ${slot.activation.toFixed(2)}`);
}

header('SERIAL BOTTLENECK ANALYSIS');

console.log(`
  Why is consciousness SERIAL despite parallel substrate?

  The thermodynamic answer:
  Serial is CHEAPER after collapse.
`);

const bottleneck = serialBottleneckAnalysis(workspace);
console.log(`  Parallel cost (maintaining all tracks): ${bottleneck.parallelCost.toFixed(2)}`);
console.log(`  Serial cost (compete + broadcast):     ${bottleneck.serialCost.toFixed(2)}`);
console.log(`  Efficiency ratio:                      ${bottleneck.efficiencyRatio.toFixed(3)}`);
console.log(`\n  ${bottleneck.explanation}`);

header('MULTIPLE BROADCAST CYCLES');

console.log(`\n  Running 10 broadcast cycles to see patterns emerge...\n`);

// Reset specialists
for (const spec of specialists) {
  workspace.registerSpecialist(spec);
}

const broadcasts: BroadcastEvent[] = [];

for (let cycle = 0; cycle < 10; cycle++) {
  // Random proposals each cycle
  for (const [id, spec] of workspace.specialists) {
    const randomPhase = Math.random() * 2 * Math.PI;
    const randomStrength = 0.3 + Math.random() * 0.7;
    const proposal = Complex.fromPolar(randomStrength, randomPhase);
    workspace.specialists.set(id, propose(spec, proposal, randomStrength));
  }

  const result = workspace.broadcast(1.0);
  if (result) {
    broadcasts.push(result);
    console.log(`  Cycle ${(cycle + 1).toString().padStart(2)}: ${result.sourceModality.padEnd(12)} won | μ-align: ${result.muAlignment.toFixed(3)} | entropy: ${result.entropyPaid.toFixed(3)}`);
  } else {
    console.log(`  Cycle ${(cycle + 1).toString().padStart(2)}: No ignition`);
  }

  // Decay between cycles
  workspace.decay(0.5);
}

section('BROADCAST STATISTICS');

const stats = analyzeBroadcastHistory(broadcasts);
console.log(`\n  Total broadcasts: ${stats.count}`);
console.log(`  Average coherence: ${stats.avgCoherence.toFixed(3)}`);
console.log(`  Average entropy paid: ${stats.avgEntropyPaid.toFixed(3)}`);
console.log(`  Average μ-alignment: ${stats.avgMuAlignment.toFixed(3)}`);
console.log(`  Coherence trend: ${stats.coherenceTrend > 0 ? '+' : ''}${stats.coherenceTrend.toFixed(3)}`);

console.log(`\n  Modality distribution:`);
for (const [modality, count] of Object.entries(stats.modalityDistribution)) {
  const pct = (count / stats.count * 100).toFixed(1);
  console.log(`    ${modality.padEnd(12)} : ${bar(count / stats.count, 15)} ${pct}%`);
}

header('FRAGMENTATION DETECTION');

console.log(`
  Fragmentation occurs when slots drift out of phase.
  The system can no longer broadcast coherently.
`);

// Force some fragmentation
workspace.slots[0].phase = 0;
workspace.slots[0].activation = 0.5;
workspace.slots[4].phase = Math.PI;
workspace.slots[4].activation = 0.5;

const fragmentation = detectFragmentation(workspace);
console.log(`\n  Fragmented: ${fragmentation.fragmented ? 'YES' : 'NO'}`);
console.log(`  Fragment count: ${fragmentation.fragmentCount}`);
console.log(`  Recovery possible: ${fragmentation.recoveryPossible ? 'YES' : 'NO'}`);

if (fragmentation.fragments.length > 0) {
  console.log('\n  Fragments:');
  for (let i = 0; i < fragmentation.fragments.length; i++) {
    const f = fragmentation.fragments[i];
    const modalities = f.slots.map(s => s.modality).join(', ');
    console.log(`    Fragment ${i + 1}: [${modalities}] strength=${f.strength.toFixed(2)}`);
  }
}

header('MEASUREMENT → WORKSPACE INTEGRATION');

console.log(`
  When measurement collapse happens (from quantum layer),
  the result flows into the workspace for broadcast.

  This is the bridge:
    Quantum collapse → Workspace injection → Global broadcast
`);

// Simulate a measurement result
const measurementResult = {
  collapsedState: MU.scale(0.85), // Near the balance primitive itself
  probability: 0.75,
  muAlignment: 0.95,
  entropyPaid: 0.12
};

console.log(`\n  Measurement input:`);
console.log(`    Collapsed state: ${measurementResult.collapsedState.toString()}`);
console.log(`    Probability: ${measurementResult.probability.toFixed(3)}`);
console.log(`    μ-alignment: ${measurementResult.muAlignment.toFixed(3)}`);
console.log(`    Entropy paid: ${measurementResult.entropyPaid.toFixed(3)}`);

const measurementBroadcast = processMeasurement(workspace, measurementResult);

console.log(`\n  Result:`);
console.log(`    Injected to slot: ${measurementBroadcast.injected.modality}`);
console.log(`    Broadcast triggered: ${measurementBroadcast.broadcastTriggered ? 'YES' : 'NO'}`);
if (measurementBroadcast.broadcast) {
  console.log(`    Coherence achieved: ${measurementBroadcast.broadcast.coherenceAchieved.toFixed(3)}`);
}

header('WORKSPACE STATE SUMMARY');

const state = workspace.getState();
console.log(`\n  Coherence: ${state.coherence.toFixed(3)}`);
console.log(`  Active slots: ${state.activeSlots} / 8`);
console.log(`  Dominant modality: ${state.dominantModality || 'none'}`);
console.log(`  Total broadcasts: ${state.totalBroadcasts}`);
console.log(`  Total entropy paid: ${state.totalEntropyPaid.toFixed(4)}`);

section('SLOT ACTIVATIONS');
for (const [modality, activation] of Object.entries(state.slotActivations)) {
  console.log(`  ${modality.padEnd(12)} : ${bar(activation)} ${activation.toFixed(2)}`);
}

header('THE SYNTHESIS');

console.log(`
  GLOBAL WORKSPACE FLOW:

    Superposition (8 μ-orientations active)
                   ↓
    Maxwell Demon selects (pays entropy cost)
                   ↓
    Measurement collapses ONE path
                   ↓
    Global Workspace BROADCASTS that path
                   ↓
    All unconscious modules receive the chosen state
                   ↓
    System-wide coherence on that μ-direction

  The demon's entropy cost becomes broadcast energy.
  The work spent selecting toward μ isn't lost —
  it's transformed into the coherence signal that binds the system.

  Broadcasting is CHEAPER than maintaining 8 parallel tracks.
  Serial is efficient AFTER collapse.

  The workspace capacity of ~8 isn't about storage limits.
  It's about maintaining coherence across one full μ-cycle.
  More than 8 orientations and you lose the closure property.
  Thoughts fragment.

  See docs/ARCHITECTURE.md for detailed Mermaid diagrams.
`);

console.log(DIVIDER);
console.log('  "Many processes, one stage. The demon pays the toll."');
console.log(DIVIDER + '\n');
