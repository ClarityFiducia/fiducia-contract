# Fiducia

A weighted trust and reputation smart contract for Stacks blockchain built with Clarity. Build trust networks, earn reputation, and create a web of credibility on-chain.

*Fiducia* - Latin for "trust, confidence, reliance"

## What It Does

Fiducia allows you to:
- Give trust points to others
- Receive trust from the community
- Build weighted reputation scores
- Trust endorsements carry weight based on endorser's reputation
- View trust networks and connections
- Track trust history and relationships

Perfect for:
- Reputation systems
- Trust networks
- Community credibility
- Learning weighted scoring
- DAO governance weights
- Social proof systems

## Features

- **Weighted Trust**: Trust from high-reputation users counts more
- **Network Effects**: Build interconnected trust webs
- **Reputation Scores**: Accumulate credibility over time
- **Trust History**: Track who trusts whom
- **Trust Levels**: Different tiers of trust (1-5 points)
- **Public Transparency**: All trust relationships visible
- **Anti-Sybil**: Weighted system prevents fake accounts

## Prerequisites

- [Clarinet](https://github.com/hirosystems/clarinet) installed
- Basic understanding of Stacks blockchain
- A Stacks wallet for testnet deployment

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/fiducia.git
cd fiducia

# Check Clarinet installation
clarinet --version
```

## Project Structure

```
fiducia/
├── contracts/
│   └── fiducia.clar         # Main trust contract
├── tests/
│   └── fiducia_test.ts      # Contract tests
├── Clarinet.toml            # Project configuration
└── README.md
```

## Usage

### Deploy Locally

```bash
# Start Clarinet console
clarinet console

# Give trust to someone (1-5 points)
(contract-call? .fiducia give-trust 
  'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC
  u5
  "Highly trustworthy community member"
)

# Check someone's reputation score
(contract-call? .fiducia get-reputation-score 
  'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC
)

# View who trusts someone
(contract-call? .fiducia get-trust-received 
  'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC
)

# Check trust between two people
(contract-call? .fiducia get-trust-between 
  tx-sender
  'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC
)
```

### Contract Functions

**give-trust (recipient, trust-level, note)**
```clarity
(contract-call? .fiducia give-trust 
  'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC
  u4
  "Great contributor, always reliable"
)
```
Give trust points (1-5) to someone with a note

**update-trust (recipient, new-trust-level, note)**
```clarity
(contract-call? .fiducia update-trust 
  'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC
  u5
  "Updated to highest trust level"
)
```
Update your trust level for someone

**revoke-trust (recipient)**
```clarity
(contract-call? .fiducia revoke-trust 
  'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC
)
```
Remove your trust from someone

**get-reputation-score (user)**
```clarity
(contract-call? .fiducia get-reputation-score 
  'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC
)
```
Get someone's weighted reputation score

**get-trust-given (user)**
```clarity
(contract-call? .fiducia get-trust-given tx-sender)
```
Get list of people you trust

**get-trust-received (user)**
```clarity
(contract-call? .fiducia get-trust-received 
  'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC
)
```
Get list of people who trust someone

**get-trust-between (trustor, trustee)**
```clarity
(contract-call? .fiducia get-trust-between 
  tx-sender
  'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC
)
```
Check trust level between two users

**get-trust-network (user)**
```clarity
(contract-call? .fiducia get-trust-network 
  'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC
)
```
Get complete trust network (who trusts them, who they trust)

**get-weighted-trust-score (user)**
```clarity
(contract-call? .fiducia get-weighted-trust-score 
  'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC
)
```
Get reputation score weighted by trustor's reputation

## How It Works

### Giving Trust
1. User selects recipient and trust level (1-5)
2. Adds note explaining why they trust them
3. Trust recorded on-chain
4. Recipient's reputation increases
5. Weighted by giver's own reputation

### Weighted Scoring
Trust isn't equal - it's weighted:
```
Your Trust Value = Your Reputation Score × Trust Level Given

Example:
- Alice (reputation: 100) gives Bob 5 trust = 500 points
- Charlie (reputation: 10) gives Bob 5 trust = 50 points
- Bob's total: 550 weighted trust points
```

### Reputation Calculation
```clarity
Reputation Score = Sum of (Trustor's Reputation × Trust Level)

New users start with base reputation of 10
As you receive trust, your reputation grows
Higher reputation = more influence in the network
```

### Trust Levels
- **Level 1**: Minimal trust - "I've met them"
- **Level 2**: Basic trust - "They seem okay"
- **Level 3**: Good trust - "I trust them"
- **Level 4**: High trust - "Very trustworthy"
- **Level 5**: Complete trust - "Fully vouch for them"

## Data Structure

### Trust Record
```clarity
{
  trustor: principal,
  trustee: principal,
  trust-level: uint,        ;; 1-5
  note: (string-utf8 500),
  timestamp: uint,
  trustor-reputation: uint  ;; Snapshot at time of trust
}
```

### User Reputation
```clarity
{
  user: principal,
  reputation-score: uint,
  trust-received-count: uint,
  trust-given-count: uint,
  weighted-trust: uint,
  first-trust-received: uint
}
```

### Storage Pattern
```clarity
;; Map of (trustor, trustee) to trust level
(define-map trust-relationships 
  {trustor: principal, trustee: principal}
  {level: uint, note: (string-utf8 500), timestamp: uint}
)

;; Map of user to reputation data
(define-map user-reputation principal reputation-data)

;; List of all trust relationships
(define-data-var trust-history (list 10000 trust-record) (list))
```

## Testing

```bash
# Run all tests
npm run test

# Check contract syntax
clarinet check

# Run specific test
npm run test -- fiducia
```

## Learning Goals

Building this contract teaches you:
- ✅ Weighted reputation systems
- ✅ Network effects and relationships
- ✅ Trust scoring algorithms
- ✅ Preventing Sybil attacks
- ✅ Graph-like data structures
- ✅ Social proof mechanisms

## Example Use Cases

**Community Trust:**
```clarity
;; Established member vouches for newcomer
(contract-call? .fiducia give-trust 
  'ST1NEWCOMER
  u3
  "New but helpful, answered my questions"
)

;; After time, upgrades trust
(contract-call? .fiducia update-trust 
  'ST1NEWCOMER
  u5
  "Proven themselves, fully trust them now"
)
```

**DAO Governance:**
```clarity
;; High reputation member's vote could count more
;; Check voter's reputation
(contract-call? .fiducia get-reputation-score 'ST1VOTER)
;; Use reputation as voting weight

;; Trust network for proposal endorsements
(contract-call? .fiducia give-trust 
  'ST1PROPOSER
  u4
  "Good track record with proposals"
)
```

**Marketplace Reputation:**
```clarity
;; Buyer trusts seller after transaction
(contract-call? .fiducia give-trust 
  'ST1SELLER
  u5
  "Great seller, fast shipping, as described"
)

;; Seller trusts buyer
(contract-call? .fiducia give-trust 
  'ST1BUYER
  u5
  "Quick payment, good communication"
)
```

**Developer Credibility:**
```clarity
;; Experienced dev vouches for junior
(contract-call? .fiducia give-trust 
  'ST1JUNIOR_DEV
  u4
  "Strong coder, good code reviews, reliable"
)

;; Team lead endorses
(contract-call? .fiducia give-trust 
  'ST1JUNIOR_DEV
  u5
  "Ready for senior role, exceptional work"
)
```

## Trust Flow

### Building Reputation:
```
1. NEW USER → Starts with base reputation (10)
   ↓
2. RECEIVES TRUST → From established members
   ↓
3. REPUTATION GROWS → Weighted by trustor's reputation
   ↓
4. GAINS INFLUENCE → Their trust now carries weight
   ↓
5. BUILDS NETWORK → Becomes trusted authority
   ↓
6. HIGH REPUTATION → Significant influence in system
```

## Reputation Examples

### New User:
```
User: Alice (New)
Reputation: 10 (starting)
Trust Received: 0
Trust Given: 0
Status: Building credibility
```

### Established Member:
```
User: Bob
Reputation: 250
Trust Received: 15 people
  - 5x Level 5 trust
  - 8x Level 4 trust
  - 2x Level 3 trust
Trust Given: 12 people
Status: Trusted community member
```

### Highly Trusted Authority:
```
User: Carol
Reputation: 1,500
Trust Received: 50+ people
Trust Given: 30+ people
Status: Community leader
Influence: High (trust carries 150x weight)
```

## Weighted Trust Example

```
Scenario: David receives trust from 3 people

1. Alice (rep: 10) gives David level 5 trust
   Weight: 10 × 5 = 50 points

2. Bob (rep: 100) gives David level 4 trust
   Weight: 100 × 4 = 400 points

3. Carol (rep: 500) gives David level 3 trust
   Weight: 500 × 3 = 1,500 points

David's Total Reputation: 1,950 points

Note: Bob's level 4 is worth more than Alice's level 5
      because Bob has higher reputation!
```

## Common Patterns

### Initial Trust Building
```clarity
;; New member joins
;; Established member gives initial trust
(contract-call? .fiducia give-trust 'ST1NEWBIE u2 "New but promising")

;; As they prove themselves
(contract-call? .fiducia update-trust 'ST1NEWBIE u4 "Really impressed")

;; Eventually full trust
(contract-call? .fiducia update-trust 'ST1NEWBIE u5 "Fully vouch for them")
```

### Check Before Trusting
```clarity
;; Check current reputation
(contract-call? .fiducia get-reputation-score 'ST1USER)

;; Check who else trusts them
(contract-call? .fiducia get-trust-received 'ST1USER)

;; Check if you already trust them
(contract-call? .fiducia get-trust-between tx-sender 'ST1USER)

;; Give trust if satisfied
(contract-call? .fiducia give-trust 'ST1USER u4 "Verified credibility")
```

### Trust Network Analysis
```clarity
;; Check your trust network
(contract-call? .fiducia get-trust-network tx-sender)

;; See mutual trust
(contract-call? .fiducia get-trust-between 'ST1USER1 'ST1USER2)
(contract-call? .fiducia get-trust-between 'ST1USER2 'ST1USER1)
```

### Revoke Trust When Needed
```clarity
;; If trust is broken
(contract-call? .fiducia revoke-trust 'ST1FORMER_FRIEND)

;; Their reputation decreases
;; Your trust no longer counts toward their score
```

## Trust Network Visualization

```
High Reputation Node (Carol: 1500)
         |
         | (trusts)
         ↓
Medium Reputation Node (Bob: 250)
         |
         | (trusts)
         ↓
Growing Reputation Node (Alice: 50)
         |
         | (trusts)
         ↓
New Node (David: 10)

Carol's trust carries most weight
Bob's trust is significant
Alice's trust helps but lighter
```

## Deployment

### Testnet
```bash
clarinet deployments generate --testnet --low-cost
clarinet deployments apply -p deployments/default.testnet-plan.yaml
```

### Mainnet
```bash
clarinet deployments generate --mainnet
clarinet deployments apply -p deployments/default.mainnet-plan.yaml
```

## Roadmap

- [ ] Write the core contract
- [ ] Add comprehensive tests
- [ ] Deploy to testnet
- [ ] Add trust decay over time
- [ ] Implement trust paths (A trusts B trusts C)
- [ ] Add trust categories (technical, business, social)
- [ ] Create trust visualization tools
- [ ] Add dispute resolution
- [ ] Implement trust inheritance

## Advanced Features (Future)

**Trust Decay:**
- Old trust slowly decreases
- Must refresh trust periodically
- Keeps network current

**Trust Paths:**
- Transitive trust (friend of friend)
- Calculate trust through network
- Discover connections

**Trust Categories:**
- Technical trust
- Business trust  
- Social trust
- Character trust

**Trust Analytics:**
- Trust flow visualization
- Influence mapping
- Network centrality
- Community clusters

**Advanced Scoring:**
- PageRank-style algorithm
- Eigentrust implementation
- Temporal weighting
- Context-aware scoring

## Security Features

- ✅ Cannot trust yourself
- ✅ Weighted system prevents Sybil attacks
- ✅ Trust history immutable
- ✅ Transparent reputation calculation
- ✅ Can revoke trust if needed
- ✅ Snapshot trustor reputation at trust time

## Best Practices

**Giving Trust:**
- Only trust people you actually know/interact with
- Be honest with trust levels
- Provide meaningful notes
- Review and update trust periodically
- Revoke if trust is broken

**Building Reputation:**
- Be consistent and reliable
- Contribute to community
- Help others
- Be transparent
- Maintain integrity

**Using Reputation:**
- Higher reputation = more responsibility
- Use influence wisely
- Support newcomers
- Build positive network effects
- Don't abuse trust

## Important Notes

⚠️ **Trust Carefully:**
- Trust is public and permanent (until revoked)
- Your reputation affects your trust weight
- False trust harms network integrity
- Be thoughtful with trust levels

💡 **Network Effects:**
- Trust from high-rep users matters more
- Build genuine relationships
- Quality over quantity
- Reputation compounds over time

🎯 **Reputation Building:**
- Starts slow, compounds fast
- Consistency matters
- Help others to build trust
- Takes time but worth it

## Limitations

**Current Constraints:**
- Trust levels 1-5 only
- Cannot give fractional trust
- Trust notes limited to 500 chars
- No automatic trust decay (yet)

**Design Choices:**
- Weighted system prevents spam
- Starting reputation prevents zero influence
- Public trust builds transparency
- Revokable trust allows correction

## Reputation Tiers

### Novice (0-50):
- New to network
- Building initial trust
- Low influence
- Learning period

### Member (51-200):
- Established presence
- Growing reputation
- Moderate influence
- Active participant

### Trusted (201-500):
- Well-known member
- Strong reputation
- Significant influence
- Community contributor

### Authority (501-1000):
- Highly respected
- Very strong reputation
- High influence
- Community leader

### Legend (1000+):
- Network cornerstone
- Maximum reputation
- Highest influence
- Trusted by many

## Use Case Ideas

**Identity Verification:**
- Known community members vouch for identity
- Weighted verification
- Sybil resistance

**Credit Scoring:**
- Trust-based credit
- Peer lending decisions
- Risk assessment

**Hiring:**
- Professional references
- Skill endorsements
- Work reputation

**Governance:**
- Weighted voting
- Proposal endorsements
- Decision influence

## Contributing

This is a learning project! Feel free to:
- Open issues for questions
- Submit PRs for improvements
- Fork and experiment
- Build trust networks

## License

MIT License - do whatever you want with it

## Resources

- [Clarity Language Reference](https://docs.stacks.co/clarity)
- [Clarinet Documentation](https://github.com/hirosystems/clarinet)
- [Stacks Blockchain](https://www.stacks.co/)
- [Reputation Systems](https://en.wikipedia.org/wiki/Reputation_system)
- [Web of Trust](https://en.wikipedia.org/wiki/Web_of_trust)

---

Built while learning Clarity 🤝

## Philosophy

"Trust is earned in drops and lost in buckets."

"Reputation is what men and women think of us; character is what God and angels know of us." - Thomas Paine

Build trust. Earn reputation. Create fiducia. 🌟

---

**Your Stats:**
- Reputation Score: ???
- Trust Received: ???
- Trust Given: ???
- Network Size: ???
- Influence Level: ???

**Who do you trust?** 💫
