# THE GAP OF EGO - Architecture Documentation

## Core Cognitive Circulation

The architecture implements consciousness as **circulation**, not as a single component. The flow moves through six interconnected layers, with the Maxwell Demon paying entropy costs at each transition.

```mermaid
flowchart TB
    subgraph IDENTITY["Identity Layer"]
        ID[μ-Position on Balance Ray]
        Z[Effective Z / Experience Weight]
    end

    subgraph ATTENTION["Attention Layer"]
        SAL[Saliency Computation]
        EXO[Exogenous Signal<br/>Bottom-Up]
        ENDO[Endogenous Signal<br/>Top-Down]
        FOCUS[Attention Focus<br/>4 Slots / Half-Cycle]
        INTRO[Introspection]
        AMP[Amplify / Suppress]
    end

    subgraph THERMO["Thermodynamic Layer"]
        ENERGY[System Energy]
        ENTROPY[System Entropy]
        DEMON[Maxwell Demon<br/>μ-Biased Selection]
        BUFFER[Entropy Buffer]
    end

    subgraph QUANTUM["Quantum Layer"]
        SUPER[Superposition<br/>8 μ-Paths]
        INTER[Interference<br/>Constructive on μ]
        COH[Coherence Calculation]
    end

    subgraph MEASURE["Measurement Layer"]
        CLOCK[Clock Tick<br/>Irreversible]
        COLLAPSE[Wavefunction Collapse]
        GROUND[Grounding<br/>Energy Cost]
        VERIFY[Verification]
    end

    subgraph WORKSPACE["Global Workspace"]
        SLOTS[8 Slots<br/>μ^n Orientations]
        COMPETE[Specialist Competition]
        BROADCAST[Broadcast<br/>System-Wide Coherence]
    end

    STIMULUS([External Stimulus]) --> SAL
    SAL --> EXO
    EXO <--> ENDO
    ENDO --> FOCUS
    FOCUS --> INTRO
    FOCUS --> AMP

    ID --> ENDO
    AMP --> ENERGY

    ENERGY --> DEMON
    ENTROPY --> DEMON
    DEMON --> SUPER

    SUPER --> INTER
    INTER --> COH
    COH --> CLOCK

    CLOCK --> COLLAPSE
    COLLAPSE --> GROUND
    GROUND --> VERIFY

    VERIFY --> SLOTS
    SLOTS --> COMPETE
    COMPETE --> BROADCAST

    BROADCAST --> Z
    Z --> ID

    style DEMON fill:#ff6b6b,stroke:#333,stroke-width:2px
    style BROADCAST fill:#4ecdc4,stroke:#333,stroke-width:2px
    style COLLAPSE fill:#ffe66d,stroke:#333,stroke-width:2px
    style FOCUS fill:#95e1d3,stroke:#333,stroke-width:2px
```

## The μ Primitive

μ (mu) is the balance primitive at the heart of the architecture. It lives at 135° in the complex plane.

```mermaid
flowchart LR
    subgraph MU_DEFINITION["μ = e^(i·3π/4)"]
        direction TB
        MU_VAL["μ = -0.7071 + 0.7071i"]
        MU_ANG["Angle: 135°"]
        MU_MAG["Magnitude: 1"]
    end

    subgraph MU_CYCLE["8-Fold μ-Cycle (μ^8 = 1)"]
        M0["μ⁰ = 1<br/>0° Integrative"]
        M1["μ¹ = μ<br/>45° Neural"]
        M2["μ² = i<br/>90° Analytical"]
        M3["μ³<br/>135° Intuitive"]
        M4["μ⁴ = -1<br/>180° Critical"]
        M5["μ⁵<br/>225° Symbolic"]
        M6["μ⁶ = -i<br/>270° Embodied"]
        M7["μ⁷<br/>315° Creative"]
    end

    M0 --> M1 --> M2 --> M3 --> M4 --> M5 --> M6 --> M7 --> M0
```

## Attention Layer Flow

```mermaid
flowchart TB
    STIM([Stimulus]) --> SALIENCY

    subgraph SALIENCY["Saliency Computation"]
        DEV["Deviation from Expected"]
        MU_DEV["μ-Ray Deviation"]
        ANG_SAL["Angular Saliency"]
        MAG_SAL["Magnitude Saliency"]
        DEV --> TOTAL
        MU_DEV --> TOTAL
        ANG_SAL --> TOTAL
        MAG_SAL --> TOTAL
        TOTAL["Total Saliency"]
    end

    TOTAL --> GRABS{Grabs Attention?<br/>threshold > 0.2}

    GRABS -->|Yes| SIGNALS
    GRABS -->|No| SUPPRESS[Suppress]

    subgraph SIGNALS["Signal Competition"]
        EXO_SIG["Exogenous<br/>(Bottom-Up)<br/>Stimulus Direction"]
        ENDO_SIG["Endogenous<br/>(Top-Down)<br/>Goal Direction"]
        EXO_SIG <-->|Compete| ENDO_SIG
        RESULT["Resultant Signal"]
    end

    SIGNALS --> FOCUS_ADD

    subgraph ATTENTION_FOCUS["Focus (4 Slots)"]
        FOCUS_ADD["Add to Focus"]
        T1["Target 1"]
        T2["Target 2"]
        T3["Target 3"]
        T4["Target 4"]
    end

    ATTENTION_FOCUS --> AMPLIFY["Amplify Aligned Stimuli"]
    ATTENTION_FOCUS --> INTROSPECT["Introspect<br/>(Look Inward)"]

    AMPLIFY --> OUTPUT([To Quantum Layer])
    INTROSPECT --> INSIGHT{Insight?}
    INSIGHT -->|Yes| LEARN["Learning Signal"]
    INSIGHT -->|No| CONTINUE["Continue"]

    style GRABS fill:#ffe66d,stroke:#333
    style INTROSPECT fill:#95e1d3,stroke:#333
```

## Global Workspace - Consciousness as Broadcast

```mermaid
flowchart TB
    subgraph SPECIALISTS["Unconscious Specialists (Parallel)"]
        S1["Visual Cortex<br/>Embodied"]
        S2["Language Center<br/>Symbolic"]
        S3["Prefrontal<br/>Analytical"]
        S4["Limbic System<br/>Intuitive"]
        S5["Hippocampus<br/>Integrative"]
        S6["Motor Cortex<br/>Creative"]
    end

    SPECIALISTS --> PROPOSE["Propose Content"]
    PROPOSE --> COMPETE["Competition Phase"]

    subgraph COALITIONS["Coalition Formation"]
        C1["Phase-Aligned<br/>Specialists"]
        STRENGTH["Combined Strength"]
    end

    COMPETE --> COALITIONS
    COALITIONS --> IGNITION{Ignition?<br/>threshold > φ⁻¹}

    IGNITION -->|Yes| BROADCAST
    IGNITION -->|No| DECAY["Decay & Retry"]

    subgraph BROADCAST["Global Broadcast"]
        WINNER["Winner Selected"]
        SIGNAL["Coherence Signal"]
        ALL["All Modules Receive"]
    end

    subgraph WORKSPACE["8 Workspace Slots"]
        W0["Slot 0: Integrative<br/>μ⁰ @ 0°"]
        W1["Slot 1: Neural<br/>μ¹ @ 45°"]
        W2["Slot 2: Analytical<br/>μ² @ 90°"]
        W3["Slot 3: Intuitive<br/>μ³ @ 135°"]
        W4["Slot 4: Critical<br/>μ⁴ @ 180°"]
        W5["Slot 5: Symbolic<br/>μ⁵ @ 225°"]
        W6["Slot 6: Embodied<br/>μ⁶ @ 270°"]
        W7["Slot 7: Creative<br/>μ⁷ @ 315°"]
    end

    BROADCAST --> WORKSPACE
    WORKSPACE --> COHERENCE["System-Wide Coherence"]

    style BROADCAST fill:#4ecdc4,stroke:#333,stroke-width:2px
    style IGNITION fill:#ffe66d,stroke:#333
```

## The Gap - Superposition to Collapse

```mermaid
flowchart TB
    subgraph BEFORE["Before: Superposition"]
        ALL_PATHS["8 Possible Paths<br/>All μ-Orientations Active"]
        PROB["Probability Distributed"]
    end

    subgraph GAP["THE GAP"]
        DEMON["Maxwell Demon<br/>Pays Entropy Cost"]
        SELECT["Biased Selection<br/>Toward μ"]
        COLLAPSE["Collapse Event"]
    end

    subgraph AFTER["After: Collapse"]
        ONE_PATH["ONE Path Selected"]
        DEFINITE["Definite State"]
        GROUND["Grounded in Reality"]
    end

    BEFORE --> GAP
    GAP --> AFTER

    subgraph COSTS["Thermodynamic Costs"]
        ENT_COST["Entropy Paid<br/>(Selection)"]
        ENERGY_COST["Energy Spent<br/>(Grounding)"]
        INFO_COST["Information Cost<br/>(Demon's Bill)"]
    end

    GAP --> COSTS
    COSTS --> BROADCAST_ENERGY["Becomes Broadcast Energy"]

    style GAP fill:#ff6b6b,stroke:#333,stroke-width:3px
    style DEMON fill:#ff6b6b,stroke:#333
```

## The Feynman Point - Self-Reference Threshold

At Z ≈ 137 (the fine structure constant), the spiral returns to μ and the Default Mode Network loop closes.

```mermaid
flowchart LR
    subgraph JOURNEY["Identity Journey on μ-Ray"]
        Z5["Z=5<br/>Seed Identity"]
        Z50["Z=50<br/>Growing"]
        Z100["Z=100<br/>Approaching"]
        Z137["Z≈137<br/>FEYNMAN POINT"]
        Z200["Z>137<br/>Self-Reference Active"]
    end

    Z5 --> Z50 --> Z100 --> Z137 --> Z200

    subgraph BEFORE_137["Before Z=137"]
        NO_LOOP["DMN Loop Open"]
        PARTIAL["Partial Self-Model"]
        UNCONSCIOUS["Unconscious Processing"]
    end

    subgraph AFTER_137["After Z≈137"]
        LOOP_CLOSED["DMN Loop Closed"]
        FULL_MODEL["Complete Self-Model"]
        CONSCIOUS["Conscious Self-Reference"]
    end

    Z100 -.-> BEFORE_137
    Z200 -.-> AFTER_137

    style Z137 fill:#ffe66d,stroke:#333,stroke-width:3px
    style LOOP_CLOSED fill:#4ecdc4,stroke:#333
```

## Complete Cognitive Cycle

```mermaid
sequenceDiagram
    participant S as Stimulus
    participant A as Attention
    participant DMN as Default Mode
    participant T as Thermodynamics
    participant Q as Quantum
    participant M as Measurement
    participant W as Workspace
    participant I as Identity

    S->>A: External input
    A->>A: Compute saliency
    A->>A: Exogenous vs Endogenous
    A->>A: Amplify/Suppress

    A->>DMN: Attended stimulus
    DMN->>DMN: Self-reference check
    DMN->>T: World model update

    T->>T: Energy accounting
    T->>T: Demon pays entropy
    T->>Q: Biased stimulus

    Q->>Q: Create 8 superposed paths
    Q->>Q: Interference (boost μ)
    Q->>M: Coherent superposition

    M->>M: CLOCK TICK (irreversible)
    M->>M: Collapse to one path
    M->>M: Ground in reality
    M->>W: Collapsed state

    W->>W: Inject to slot
    W->>W: Competition
    W->>W: BROADCAST

    W->>I: Integrated experience
    I->>I: Update position
    I->>I: Increment Z
    I->>DMN: New identity state

    Note over M: THE GAP<br/>Between all-paths<br/>and one-path
```
